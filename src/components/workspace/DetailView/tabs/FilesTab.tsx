import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { DownloadOutlined } from '@ant-design/icons';
import type { DatapackFileItem } from '@rcabench/client';
import { useQuery } from '@tanstack/react-query';
import { Breadcrumb, Button, Empty, message } from 'antd';

import { injectionApi } from '@/api/injections';

import ArrowViewer from './ArrowViewer';
import FilesTable from './FilesTable';
import JsonViewer from './JsonViewer';

interface FilesTabProps {
  injectionId: number;
  onNavigate?: (path: string) => void;
}

/**
 * Files tab component - File browser with lazy loading and caching
 */
const FilesTab: React.FC<FilesTabProps> = ({ injectionId, onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract path segments after 'files' (e.g., /workspace/project/injections/123/files/folder1/folder2 => ['folder1', 'folder2'])
  const pathSegments = useMemo(
    () => location.pathname.split('/').filter(Boolean),
    [location.pathname]
  );

  // Find the entity (injections/executions) and its ID, then find 'files' tab
  const entityIndex = useMemo(
    () =>
      pathSegments.findIndex(
        (seg) => seg === 'injections' || seg === 'executions'
      ),
    [pathSegments]
  );
  const entityId = useMemo(
    () => (entityIndex !== -1 ? pathSegments[entityIndex + 1] : null),
    [entityIndex, pathSegments]
  );
  const filesIndex = useMemo(
    () => pathSegments.findIndex((seg) => seg === 'files'),
    [pathSegments]
  );
  const pathAfterFiles = useMemo(
    () => (filesIndex !== -1 ? pathSegments.slice(filesIndex + 1) : []),
    [filesIndex, pathSegments]
  );

  // Check if last segment is a file (has extension) or folder
  const lastSegment = pathAfterFiles[pathAfterFiles.length - 1];
  const isFile = lastSegment && lastSegment.includes('.');

  const [currentPath, setCurrentPath] = useState<string[]>(() => {
    // Initialize from URL path
    return isFile ? pathAfterFiles.slice(0, -1) : pathAfterFiles;
  });

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    data: unknown | ArrayBuffer;
    path?: string;
    type?: 'json' | 'arrow';
  } | null>(null);

  // Fetch files data with caching - only loads when component is mounted
  const {
    data: filesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['injection-files', injectionId],
    queryFn: () => injectionApi.listDatapackFiles(injectionId),
    enabled: !!injectionId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const files = useMemo(() => filesData?.files ?? [], [filesData?.files]);

  // Sync currentPath with URL
  useEffect(() => {
    const newPath = isFile ? pathAfterFiles.slice(0, -1) : pathAfterFiles;
    const pathChanged = JSON.stringify(newPath) !== JSON.stringify(currentPath);

    // If we're at the root of files tab (no path after /files), clear selectedFile
    if (filesIndex !== -1 && pathAfterFiles.length === 0 && selectedFile) {
      setSelectedFile(null);
    }

    if (pathChanged && !selectedFile) {
      setCurrentPath(newPath);
    }
  }, [
    currentPath,
    isFile,
    location.pathname,
    pathAfterFiles,
    selectedFile,
    filesIndex,
  ]);

  // Load file from URL if present
  useEffect(() => {
    if (isFile && lastSegment && files.length > 0) {
      // Find the file in the current folder
      const findFileInPath = (
        items: DatapackFileItem[],
        pathParts: string[]
      ): DatapackFileItem | null => {
        if (pathParts.length === 0) return null;

        let current = items;
        // Navigate through folders
        for (let i = 0; i < pathParts.length - 1; i++) {
          const folder = current.find(
            (item) =>
              item.name === pathParts[i] && (item.children?.length ?? 0) > 0
          );
          if (!folder?.children) return null;
          current = folder.children;
        }

        // Find the file
        const fileName = pathParts[pathParts.length - 1];
        return current.find((item) => item.name === fileName) ?? null;
      };

      const fileToLoad = findFileInPath(files, pathAfterFiles);

      // Only load if we don't have this file selected or it's a different file
      if (fileToLoad && fileToLoad.name !== selectedFile?.name) {
        const fileName = fileToLoad.name ?? '';

        if (fileName.endsWith('.json')) {
          // Load JSON file
          (async () => {
            try {
              message.loading({
                content: `Loading ${fileName}...`,
                key: 'load-file',
              });

              const blob = await injectionApi.downloadDatapackFile(
                injectionId,
                fileToLoad.path ?? ''
              );

              const text = await blob.text();
              const jsonData = JSON.parse(text);

              setSelectedFile({
                name: fileName,
                data: jsonData,
                path: fileToLoad.path,
                type: 'json',
              });

              message.destroy('load-file');
            } catch (error) {
              console.error('Failed to load JSON file:', error);
              message.error({
                content: 'Failed to load JSON file',
                key: 'load-file',
              });
            }
          })();
        } else if (fileName.endsWith('.parquet')) {
          // Parquet files: only set metadata, ArrowViewer fetches data itself
          setSelectedFile({
            name: fileName,
            data: null,
            path: fileToLoad.path,
            type: 'arrow',
          });
        }
      }
    }
  }, [
    isFile,
    lastSegment,
    files.length,
    injectionId,
    selectedFile?.name,
    files,
    pathAfterFiles,
  ]);

  // Get current folder's content based on currentPath
  const getCurrentFolderContent = useMemo(() => {
    let current = files;
    for (const segment of currentPath) {
      const folder = current.find(
        (item) => item.name === segment && (item.children?.length ?? 0) > 0
      );
      if (folder?.children) {
        current = folder.children;
      } else {
        return [];
      }
    }
    return current;
  }, [files, currentPath]);

  // Navigate to a folder
  const handleFolderClick = (folderName: string) => {
    const newPath = [...currentPath, folderName];
    setCurrentPath(newPath);
    // Build new URL path: keep everything up to and including 'files'
    if (entityIndex !== -1 && entityId && filesIndex !== -1) {
      const basePath = pathSegments.slice(0, filesIndex + 1).join('/');
      const newUrl = `/${basePath}/${newPath.join('/')}`;
      navigate(newUrl);
    }
  };

  // Handle file click - check if it's a JSON or Parquet file
  const handleFileClick = async (file: DatapackFileItem) => {
    const fileName = file.name ?? '';

    if (fileName.endsWith('.json')) {
      try {
        message.loading({
          content: `Loading ${fileName}...`,
          key: 'load-file',
        });

        // Download the JSON file as blob
        const blob = await injectionApi.downloadDatapackFile(
          injectionId,
          file.path ?? ''
        );

        // Convert blob to text and parse as JSON
        const text = await blob.text();
        const jsonData = JSON.parse(text);

        setSelectedFile({
          name: fileName,
          data: jsonData,
          path: file.path,
          type: 'json',
        });

        // Update URL with file in path
        if (entityIndex !== -1 && entityId && filesIndex !== -1) {
          const basePath = pathSegments.slice(0, filesIndex + 1).join('/');
          const folderPath =
            currentPath.length > 0 ? `/${currentPath.join('/')}` : '';
          const newUrl = `/${basePath}${folderPath}/${fileName}`;
          navigate(newUrl);
        }

        message.destroy('load-file');
        return;
      } catch (error) {
        console.error('Failed to load JSON file:', error);
        message.error({
          content: 'Failed to load JSON file',
          key: 'load-file',
        });
        return;
      }
    }

    if (fileName.endsWith('.parquet')) {
      // Parquet files: only set metadata, ArrowViewer fetches data itself
      setSelectedFile({
        name: fileName,
        data: null,
        path: file.path,
        type: 'arrow',
      });

      // Update URL with file in path
      if (entityIndex !== -1 && entityId && filesIndex !== -1) {
        const basePath = pathSegments.slice(0, filesIndex + 1).join('/');
        const folderPath =
          currentPath.length > 0 ? `/${currentPath.join('/')}` : '';
        const newUrl = `/${basePath}${folderPath}/${fileName}`;
        navigate(newUrl);
      }
      return;
    }

    // For non-JSON files, use onNavigate if provided
    if (onNavigate) {
      onNavigate(file.path ?? '');
    }
  };

  // Handle file download
  const handleDownload = async (file: DatapackFileItem) => {
    try {
      const filePath = file.path ?? '';
      const fileName = file.name ?? 'file';

      message.loading({
        content: `Downloading ${fileName}...`,
        key: 'download',
      });

      // Call the download API
      const blob = await injectionApi.downloadDatapackFile(
        injectionId,
        filePath
      );

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      message.success({ content: `Downloaded ${fileName}`, key: 'download' });
    } catch (error) {
      console.error('Download failed:', error);
      message.error({ content: 'Download failed', key: 'download' });
    }
  };

  // Handle current file download (from breadcrumb)
  const handleCurrentFileDownload = () => {
    if (selectedFile?.path) {
      handleDownload({
        path: selectedFile.path,
        name: selectedFile.name,
      } as DatapackFileItem);
    }
  };

  // Navigate to a specific path level
  const handleBreadcrumbClick = (index: number) => {
    let newPath: string[];
    if (index === -1) {
      // Click on root
      newPath = [];
    } else {
      // Click on a path segment
      newPath = currentPath.slice(0, index + 1);
    }
    setCurrentPath(newPath);
    setSelectedFile(null);

    // Build new URL path
    if (entityIndex !== -1 && entityId && filesIndex !== -1) {
      const basePath = pathSegments.slice(0, filesIndex + 1).join('/');
      const newUrl =
        newPath.length > 0
          ? `/${basePath}/${newPath.join('/')}`
          : `/${basePath}`;
      navigate(newUrl);
    }
  };

  // Generate breadcrumb items
  const breadcrumbItems = [
    {
      title: (
        <span
          onClick={() => {
            handleBreadcrumbClick(-1);
            setSelectedFile(null);
          }}
          style={{ cursor: 'pointer' }}
        >
          &gt; root
        </span>
      ),
    },
    ...currentPath.map((segment, index) => ({
      title: (
        <span
          onClick={() => {
            handleBreadcrumbClick(index);
            setSelectedFile(null);
          }}
          style={{ cursor: 'pointer' }}
        >
          {segment}
        </span>
      ),
    })),
    // Add file name if viewing a file
    ...(selectedFile
      ? [
          {
            title: <span>{selectedFile.name}</span>,
          },
        ]
      : []),
  ];

  // Show error state
  if (error) {
    return (
      <div className='files-tab-empty'>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description='Failed to load files'
        />
      </div>
    );
  }

  // Show empty state
  if (!isLoading && (!files || files.length === 0)) {
    return (
      <div className='files-tab-empty'>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description='No files available for this run'
        />
      </div>
    );
  }

  return (
    <div className='files-tab'>
      {/* Breadcrumb navigation with download button */}
      <div
        style={{
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Breadcrumb items={breadcrumbItems} />
        {selectedFile && (
          <Button
            type='text'
            icon={<DownloadOutlined />}
            onClick={handleCurrentFileDownload}
            title='Download file'
          />
        )}
      </div>

      {/* Content area - FilesTable, JSON viewer, or Arrow viewer */}
      {selectedFile ? (
        selectedFile.type === 'arrow' ? (
          <ArrowViewer
            injectionId={injectionId}
            filePath={selectedFile.path ?? ''}
          />
        ) : (
          <JsonViewer data={selectedFile.data} />
        )
      ) : (
        <FilesTable
          files={getCurrentFolderContent}
          loading={isLoading}
          onFolderClick={handleFolderClick}
          onFileClick={handleFileClick}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

export default FilesTab;

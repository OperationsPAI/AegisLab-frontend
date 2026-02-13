import ReactJson from 'react-json-view';

/**
 * JSON Viewer Component using react-json-view
 * Provides built-in features: syntax highlighting, collapse/expand, search, etc.
 */

interface JsonViewerProps {
  data: unknown;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e1e4e8',
        borderRadius: '6px',
        padding: '16px',
        maxHeight: '70vh',
        overflow: 'auto',
      }}
    >
      <ReactJson
        src={data as object}
        theme='rjv-default'
        iconStyle='triangle'
        displayDataTypes={false}
        displayObjectSize
        enableClipboard
        collapsed={3}
        collapseStringsAfterLength={50}
        name={false}
      />
    </div>
  );
};

export default JsonViewer;

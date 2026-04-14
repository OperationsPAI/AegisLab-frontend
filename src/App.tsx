import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Spin } from 'antd';

import MainLayout from '@/components/layout/MainLayout';
import WorkspaceLayout from '@/components/layout/WorkspaceLayout';
import { useAuthStore } from '@/store/auth';

// Lazy load all page components
const Login = lazy(() => import('@/pages/auth/Login'));

// User pages
const HomePage = lazy(() => import('@/pages/home/HomePage'));
const ProjectList = lazy(() => import('@/pages/projects/ProjectList'));
const ProjectOverview = lazy(() => import('@/pages/projects/ProjectOverview'));
const ProjectSettings = lazy(() => import('@/pages/projects/ProjectSettings'));

// Project-scoped pages (injections, executions under /:teamName/:projectName)
const ProjectInjectionList = lazy(
  () => import('@/pages/projects/ProjectInjectionList')
);
const ProjectExecutionList = lazy(
  () => import('@/pages/projects/ProjectExecutionList')
);
const ProjectInjectionDetail = lazy(
  () => import('@/pages/projects/ProjectInjectionDetail')
);
const ProjectExecutionDetail = lazy(
  () => import('@/pages/projects/ProjectExecutionDetail')
);
const InjectionCreate = lazy(
  () => import('@/pages/injections/InjectionCreate')
);
const ExecutionCreatePage = lazy(
  () => import('@/pages/executions/ExecutionCreatePage')
);
const AlgorithmListPage = lazy(
  () => import('@/pages/projects/algorithms/AlgorithmListPage')
);

// Admin pages
const ProjectEdit = lazy(() => import('@/pages/projects/ProjectEdit'));
const ContainerList = lazy(() => import('@/pages/containers/ContainerList'));
const ContainerForm = lazy(() => import('@/pages/containers/ContainerForm'));
const ContainerDetail = lazy(
  () => import('@/pages/containers/ContainerDetail')
);
const ContainerVersions = lazy(
  () => import('@/pages/containers/ContainerVersions')
);
const DatasetList = lazy(() => import('@/pages/datasets/DatasetList'));
const DatasetForm = lazy(() => import('@/pages/datasets/DatasetForm'));
const DatasetDetail = lazy(() => import('@/pages/datasets/DatasetDetail'));
const EvaluationList = lazy(() => import('@/pages/evaluations/EvaluationList'));
const EvaluationDetail = lazy(
  () => import('@/pages/evaluations/EvaluationDetail')
);
const TaskList = lazy(() => import('@/pages/tasks/TaskList'));
const TaskDetail = lazy(() => import('@/pages/tasks/TaskDetail'));
const SystemSettings = lazy(() => import('@/pages/system/SystemSettings'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const Settings = lazy(() => import('@/pages/settings/Settings'));

// Team pages
const TeamDetailPage = lazy(() => import('@/pages/teams/TeamDetailPage'));

// Traces pages
const TracesPage = lazy(() => import('@/pages/traces/TracesPage'));
const TraceDetailPage = lazy(() => import('@/pages/traces/TraceDetailPage'));

// Admin pages (new)
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));

// Loading fallback component
const LoadingFallback = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      minHeight: 200,
    }}
  >
    <Spin size='large' />
  </div>
);

function App() {
  const { isAuthenticated, loadUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadUser();
    }
  }, [isAuthenticated, loadUser]);

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path='/login'
        element={
          <Suspense fallback={<LoadingFallback />}>
            <Login />
          </Suspense>
        }
      />

      {/* Protected routes - Main Layout (sidebar visible) */}
      <Route
        element={
          isAuthenticated ? <MainLayout /> : <Navigate to='/login' replace />
        }
      >
        {/* Default redirect */}
        <Route index element={<Navigate to='/home' replace />} />

        {/* ==================== User Routes ==================== */}

        {/* Home */}
        <Route
          path='home'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <HomePage />
            </Suspense>
          }
        />

        {/* Projects List */}
        <Route
          path='projects'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProjectList />
            </Suspense>
          }
        />
        <Route
          path='projects/new'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProjectEdit />
            </Suspense>
          }
        />

        {/* Profile */}
        <Route
          path='profile'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProfilePage />
            </Suspense>
          }
        />

        {/* Settings */}
        <Route
          path='settings'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Settings />
            </Suspense>
          }
        />

        {/* Tasks (promoted from /admin/tasks) */}
        <Route
          path='tasks'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <TaskList />
            </Suspense>
          }
        />
        <Route
          path='tasks/:id'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <TaskDetail />
            </Suspense>
          }
        />

        {/* ==================== Team Routes (/:teamName) ==================== */}
        <Route path=':teamName'>
          {/* Default route - redirect to overview */}
          <Route
            index
            element={
              <Suspense fallback={<LoadingFallback />}>
                <TeamDetailPage />
              </Suspense>
            }
          />
          {/* Tab routes */}
          <Route
            path='overview'
            element={
              <Suspense fallback={<LoadingFallback />}>
                <TeamDetailPage />
              </Suspense>
            }
          />
          <Route
            path='projects'
            element={
              <Suspense fallback={<LoadingFallback />}>
                <TeamDetailPage />
              </Suspense>
            }
          />
          <Route
            path='users'
            element={
              <Suspense fallback={<LoadingFallback />}>
                <TeamDetailPage />
              </Suspense>
            }
          />
          <Route
            path='settings'
            element={
              <Suspense fallback={<LoadingFallback />}>
                <TeamDetailPage />
              </Suspense>
            }
          />
        </Route>

        {/* ==================== Admin Routes (/admin/*) ==================== */}

        {/* Admin Users */}
        <Route
          path='admin/users'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminUsersPage />
            </Suspense>
          }
        />

        {/* Admin Containers */}
        <Route
          path='admin/containers'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ContainerList />
            </Suspense>
          }
        />
        <Route
          path='admin/containers/new'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ContainerForm />
            </Suspense>
          }
        />
        <Route
          path='admin/containers/:id'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ContainerDetail />
            </Suspense>
          }
        />
        <Route
          path='admin/containers/:id/edit'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ContainerForm />
            </Suspense>
          }
        />
        <Route
          path='admin/containers/:id/versions'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ContainerVersions />
            </Suspense>
          }
        />

        {/* Admin Datasets */}
        <Route
          path='admin/datasets'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <DatasetList />
            </Suspense>
          }
        />
        <Route
          path='admin/datasets/new'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <DatasetForm />
            </Suspense>
          }
        />
        <Route
          path='admin/datasets/:id'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <DatasetDetail />
            </Suspense>
          }
        />
        <Route
          path='admin/datasets/:id/edit'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <DatasetForm />
            </Suspense>
          }
        />

        {/* Admin System */}
        <Route
          path='admin/system'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <SystemSettings />
            </Suspense>
          }
        />
      </Route>

      {/* ==================== Project-scoped Routes (/:teamName/:projectName/*) - Workspace Layout ==================== */}
      {/* These routes are outside MainLayout to hide the main sidebar */}
      {/* NOTE: Project names cannot use reserved keywords: overview, projects, users, settings */}
      <Route
        path=':teamName/:projectName'
        element={
          isAuthenticated ? (
            <Suspense fallback={<LoadingFallback />}>
              <WorkspaceLayout />
            </Suspense>
          ) : (
            <Navigate to='/login' replace />
          )
        }
      >
        {/* Project Overview (default) */}
        <Route
          index
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProjectOverview />
            </Suspense>
          }
        />

        {/* Injections */}
        <Route
          path='injections'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProjectInjectionList />
            </Suspense>
          }
        />
        <Route
          path='injections/create'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <InjectionCreate />
            </Suspense>
          }
        />
        <Route
          path='injections/:id/*'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProjectInjectionDetail />
            </Suspense>
          }
        />

        {/* Executions */}
        <Route
          path='executions'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProjectExecutionList />
            </Suspense>
          }
        />
        <Route
          path='executions/new'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ExecutionCreatePage />
            </Suspense>
          }
        />
        <Route
          path='executions/:id'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProjectExecutionDetail />
            </Suspense>
          }
        />

        {/* Evaluations */}
        <Route
          path='evaluations'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <EvaluationList />
            </Suspense>
          }
        />
        <Route
          path='evaluations/:id'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <EvaluationDetail />
            </Suspense>
          }
        />

        {/* Algorithms */}
        <Route
          path='algorithms'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AlgorithmListPage />
            </Suspense>
          }
        />

        {/* Traces */}
        <Route
          path='traces'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <TracesPage />
            </Suspense>
          }
        />
        <Route
          path='traces/:id'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <TraceDetailPage />
            </Suspense>
          }
        />

        {/* Project Settings */}
        <Route
          path='settings'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProjectSettings />
            </Suspense>
          }
        />
      </Route>

      {/* Fallback - redirect unknown routes to home */}
      <Route
        path='*'
        element={
          isAuthenticated ? (
            <Navigate to='/home' replace />
          ) : (
            <Navigate to='/login' replace />
          )
        }
      />
    </Routes>
  );
}

export default App;

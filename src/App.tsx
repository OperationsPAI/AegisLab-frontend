import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import MainLayout from '@/components/layout/MainLayout';
import ProjectLayout from '@/components/layout/ProjectLayout';
import { useAuthStore } from '@/store/auth';

// Lazy load all page components
const Login = lazy(() => import('@/pages/auth/Login'));

// User pages
const HomePage = lazy(() => import('@/pages/home/HomePage'));
const ProjectList = lazy(() => import('@/pages/projects/ProjectList'));
const ProjectOverview = lazy(() => import('@/pages/projects/ProjectOverview'));
const ProjectWorkspace = lazy(
  () => import('@/pages/projects/ProjectWorkspace')
);
const ProjectSettings = lazy(() => import('@/pages/projects/ProjectSettings'));

// Project-scoped pages (injections, executions, artifacts under /:projectName)
const InjectionList = lazy(() => import('@/pages/injections/InjectionList'));
const InjectionCreate = lazy(
  () => import('@/pages/injections/InjectionCreate')
);
const InjectionDetail = lazy(
  () => import('@/pages/injections/InjectionDetail')
);
const ExecutionList = lazy(() => import('@/pages/executions/ExecutionList'));
const ExecutionForm = lazy(() => import('@/pages/executions/ExecutionForm'));
const ExecutionDetail = lazy(
  () => import('@/pages/executions/ExecutionDetail')
);

// Admin pages (original flat routes with /admin prefix)
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
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
const DatapackList = lazy(() => import('@/pages/datapacks/DatapackList'));
const DatapackDetail = lazy(() => import('@/pages/datapacks/DatapackDetail'));
const AdminInjectionList = lazy(
  () => import('@/pages/injections/InjectionList')
);
const AdminInjectionCreate = lazy(
  () => import('@/pages/injections/InjectionCreate')
);
const AdminInjectionDetail = lazy(
  () => import('@/pages/injections/InjectionDetail')
);
const AdminExecutionList = lazy(
  () => import('@/pages/executions/ExecutionList')
);
const AdminExecutionForm = lazy(
  () => import('@/pages/executions/ExecutionForm')
);
const AdminExecutionDetail = lazy(
  () => import('@/pages/executions/ExecutionDetail')
);
const EvaluationList = lazy(() => import('@/pages/evaluations/EvaluationList'));
const EvaluationForm = lazy(() => import('@/pages/evaluations/EvaluationForm'));
const EvaluationDetail = lazy(
  () => import('@/pages/evaluations/EvaluationDetail')
);
const TaskList = lazy(() => import('@/pages/tasks/TaskList'));
const TaskDetail = lazy(() => import('@/pages/tasks/TaskDetail'));
const SystemSettings = lazy(() => import('@/pages/system/SystemSettings'));
const UserProfile = lazy(() => import('@/pages/settings/UserProfile'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const Settings = lazy(() => import('@/pages/settings/Settings'));
const UtilityTest = lazy(() => import('@/pages/UtilityTest'));

// Team pages
const TeamDetailPage = lazy(() => import('@/pages/teams/TeamDetailPage'));

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
    Loading...
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

      {/* Protected routes */}
      <Route
        path='/*'
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

        {/* Profile - New Wandb-style profile page */}
        <Route
          path='profile'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProfilePage />
            </Suspense>
          }
        />

        {/* ==================== Team Routes (/teams/:teamName) ==================== */}
        <Route
          path='teams/:teamName'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <TeamDetailPage />
            </Suspense>
          }
        />

        {/* ==================== Project-scoped Routes (/:projectName/*) ==================== */}
        <Route
          path=':projectName'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProjectLayout />
            </Suspense>
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

          {/* Workspace */}
          <Route
            path='workspace'
            element={
              <Suspense fallback={<LoadingFallback />}>
                <ProjectWorkspace />
              </Suspense>
            }
          />

          {/* Injections */}
          <Route
            path='injections'
            element={
              <Suspense fallback={<LoadingFallback />}>
                <InjectionList />
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
            path='injections/:id'
            element={
              <Suspense fallback={<LoadingFallback />}>
                <InjectionDetail />
              </Suspense>
            }
          />

          {/* Executions */}
          <Route
            path='executions'
            element={
              <Suspense fallback={<LoadingFallback />}>
                <ExecutionList />
              </Suspense>
            }
          />
          <Route
            path='executions/new'
            element={
              <Suspense fallback={<LoadingFallback />}>
                <ExecutionForm />
              </Suspense>
            }
          />
          <Route
            path='executions/:id'
            element={
              <Suspense fallback={<LoadingFallback />}>
                <ExecutionDetail />
              </Suspense>
            }
          />

          {/* Artifacts (placeholder) */}
          <Route
            path='artifacts'
            element={
              <Suspense fallback={<LoadingFallback />}>
                <div style={{ padding: 24 }}>Artifacts list coming soon</div>
              </Suspense>
            }
          />
          <Route
            path='artifacts/:id'
            element={
              <Suspense fallback={<LoadingFallback />}>
                <div style={{ padding: 24 }}>Artifact detail coming soon</div>
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

        {/* ==================== Admin Routes (/admin/*) ==================== */}
        <Route
          path='admin/dashboard'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Dashboard />
            </Suspense>
          }
        />

        {/* Admin Projects */}
        <Route
          path='admin/projects'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProjectList />
            </Suspense>
          }
        />
        <Route
          path='admin/projects/:id/edit'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProjectEdit />
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

        {/* Admin Datapacks */}
        <Route
          path='admin/datapacks'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <DatapackList />
            </Suspense>
          }
        />
        <Route
          path='admin/datapacks/:id'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <DatapackDetail />
            </Suspense>
          }
        />

        {/* Admin Injections */}
        <Route
          path='admin/injections'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminInjectionList />
            </Suspense>
          }
        />
        <Route
          path='admin/injections/create'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminInjectionCreate />
            </Suspense>
          }
        />
        <Route
          path='admin/injections/:id'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminInjectionDetail />
            </Suspense>
          }
        />

        {/* Admin Executions */}
        <Route
          path='admin/executions'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminExecutionList />
            </Suspense>
          }
        />
        <Route
          path='admin/executions/new'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminExecutionForm />
            </Suspense>
          }
        />
        <Route
          path='admin/executions/:id'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminExecutionDetail />
            </Suspense>
          }
        />

        {/* Admin Evaluations */}
        <Route
          path='admin/evaluations'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <EvaluationList />
            </Suspense>
          }
        />
        <Route
          path='admin/evaluations/new'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <EvaluationForm />
            </Suspense>
          }
        />
        <Route
          path='admin/evaluations/:id'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <EvaluationDetail />
            </Suspense>
          }
        />

        {/* Admin Tasks */}
        <Route
          path='admin/tasks'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <TaskList />
            </Suspense>
          }
        />
        <Route
          path='admin/tasks/:id'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <TaskDetail />
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

        {/* Admin Settings */}
        <Route
          path='admin/settings/profile'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <UserProfile />
            </Suspense>
          }
        />
        <Route
          path='admin/settings'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Settings />
            </Suspense>
          }
        />

        {/* Utility Test */}
        <Route
          path='utility-test'
          element={
            <Suspense fallback={<LoadingFallback />}>
              <UtilityTest />
            </Suspense>
          }
        />

        {/* Legacy route redirects (for backward compatibility) */}
        <Route
          path='dashboard'
          element={<Navigate to='/admin/dashboard' replace />}
        />
        <Route
          path='containers/*'
          element={<Navigate to='/admin/containers' replace />}
        />
        <Route
          path='datasets/*'
          element={<Navigate to='/admin/datasets' replace />}
        />
        <Route
          path='datapacks/*'
          element={<Navigate to='/admin/datapacks' replace />}
        />
        <Route
          path='injections'
          element={<Navigate to='/admin/injections' replace />}
        />
        <Route
          path='executions'
          element={<Navigate to='/admin/executions' replace />}
        />
        <Route
          path='evaluations/*'
          element={<Navigate to='/admin/evaluations' replace />}
        />
        <Route
          path='tasks/*'
          element={<Navigate to='/admin/tasks' replace />}
        />
        <Route
          path='system'
          element={<Navigate to='/admin/system' replace />}
        />
        <Route
          path='settings/*'
          element={<Navigate to='/admin/settings' replace />}
        />

        {/* Fallback */}
        <Route path='*' element={<Navigate to='/home' replace />} />
      </Route>
    </Routes>
  );
}

export default App;

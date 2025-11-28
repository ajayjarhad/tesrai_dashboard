import { RouterProvider } from '@tanstack/react-router';
import { AppErrorBoundary } from './components/error-boundary/AppErrorBoundary';
import { AppProviders } from './providers/AppProviders';
import { router } from './router/index';

function App() {
  return (
    <AppErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </AppErrorBoundary>
  );
}

export default App;

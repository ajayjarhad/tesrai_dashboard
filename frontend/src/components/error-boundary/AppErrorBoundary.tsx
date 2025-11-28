import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface AppErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error | null; resetError: () => void }>;
}

class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  override render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback ? this.props.fallback : DefaultErrorFallback;
      return <FallbackComponent error={this.state.error ?? null} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback = ({
  error,
  resetError,
}: {
  error: Error | null;
  resetError: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="text-muted-foreground">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="pt-4">
          <button
            type="button"
            onClick={resetError}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
};

export { AppErrorBoundary };

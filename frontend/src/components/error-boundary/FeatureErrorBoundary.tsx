import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error | null; resetError: () => void }>;
  featureName?: string;
}

class FeatureErrorBoundary extends React.Component<FeatureErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `Feature Error Boundary (${this.props.featureName || 'Unknown'}) caught an error:`,
      error,
      errorInfo
    );
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  override render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback
        ? this.props.fallback
        : DefaultFeatureErrorFallback;
      return <FallbackComponent error={this.state.error ?? null} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultFeatureErrorFallback = ({
  error,
  resetError,
}: {
  error: Error | null;
  resetError: () => void;
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-destructive"
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
      <h3 className="text-lg font-medium text-foreground">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {error?.message || 'An unexpected error occurred in this feature.'}
      </p>
      <div className="mt-4">
        <button
          type="button"
          onClick={resetError}
          className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Reset Feature
        </button>
      </div>
    </div>
  );
};

export { FeatureErrorBoundary };

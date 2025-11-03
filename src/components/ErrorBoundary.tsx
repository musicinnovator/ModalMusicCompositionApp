import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log additional debugging information
    console.error('Component stack:', errorInfo.componentStack);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive" />
              <h2 className="text-xl font-semibold">Something went wrong</h2>
            </div>
            
            <Alert className="mb-4">
              <AlertDescription>
                The application encountered an unexpected error. This might be due to:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>A performance issue or timeout</li>
                  <li>Invalid musical data or mode configuration</li>
                  <li>Browser compatibility issue</li>
                  <li>Temporary memory or processing constraint</li>
                </ul>
              </AlertDescription>
            </Alert>

            {this.state.error && (
              <div className="mb-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">Error Details:</p>
                <p className="text-sm text-muted-foreground">{this.state.error.message}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={this.handleRetry} variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={this.handleReload} variant="outline">
                Reload Page
              </Button>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              If this error persists, try:
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Clearing your browser cache</li>
                <li>Using a simpler theme or fewer fugue voices</li>
                <li>Refreshing the page to reset the application state</li>
              </ul>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: T) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
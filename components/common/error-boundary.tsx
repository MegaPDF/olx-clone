"use client";

import React, { ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  RefreshCw,
  Bug,
  Home,
  ChevronDown,
  ChevronRight,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showDetails: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  allowRetry?: boolean;
  allowReportBug?: boolean;
  className?: string;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error);
      console.error("Error info:", errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Send error to monitoring service (e.g., Sentry)
    // This would be implemented based on your error tracking service
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // Example error reporting - replace with your actual error tracking service
    const errorData = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof window !== "undefined" ? navigator.userAgent : "",
    };

    // Send to your error tracking service
    // For example: Sentry.captureException(error, { extra: errorData });
    console.error("Error reported:", errorData);
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: "",
        showDetails: false,
      });
    }
  };

  private handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;

    const bugReport = {
      errorId,
      message: error?.message || "Unknown error",
      stack: error?.stack || "",
      componentStack: errorInfo?.componentStack || "",
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    // Copy bug report to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(bugReport, null, 2));
    }

    // Or redirect to bug report form
    // window.open(`/support/bug-report?data=${encodeURIComponent(JSON.stringify(bugReport))}`);
  };

  private handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  private copyErrorDetails = () => {
    const { error, errorInfo, errorId } = this.state;

    const errorDetails = {
      errorId,
      message: error?.message || "Unknown error",
      stack: error?.stack || "",
      componentStack: errorInfo?.componentStack || "",
      timestamp: new Date().toISOString(),
    };

    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, errorId, showDetails } = this.state;
      const {
        allowRetry = true,
        allowReportBug = true,
        showDetails: showDetailsDefault = false,
      } = this.props;
      const canRetry = this.retryCount < this.maxRetries;

      return (
        <div
          className={cn(
            "flex items-center justify-center min-h-[400px] p-4",
            this.props.className
          )}
        >
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold">
                Something went wrong
              </CardTitle>
              <CardDescription>
                An unexpected error occurred. We apologize for the
                inconvenience.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <Alert>
                  <Bug className="h-4 w-4" />
                  <AlertDescription className="font-mono text-sm">
                    {error.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error ID for support */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Error ID:{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {errorId}
                  </code>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                {allowRetry && canRetry && (
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again ({this.maxRetries - this.retryCount} attempts
                    left)
                  </Button>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={this.handleGoHome}
                    className="flex-1"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Button>

                  {allowReportBug && (
                    <Button
                      variant="outline"
                      onClick={this.handleReportBug}
                      className="flex-1"
                    >
                      <Bug className="mr-2 h-4 w-4" />
                      Report Bug
                    </Button>
                  )}
                </div>
              </div>

              {/* Error details toggle */}
              {(showDetailsDefault || showDetails) && (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.toggleDetails}
                    className="w-full justify-between"
                  >
                    <span>Error Details</span>
                    {showDetails ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>

                  {showDetails && (
                    <div className="space-y-2">
                      <div className="bg-muted p-3 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Stack Trace</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={this.copyErrorDetails}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <pre className="text-xs overflow-auto max-h-32 text-muted-foreground">
                          {error?.stack || "No stack trace available"}
                        </pre>
                      </div>

                      {errorInfo?.componentStack && (
                        <div className="bg-muted p-3 rounded-md">
                          <h4 className="text-sm font-medium mb-2">
                            Component Stack
                          </h4>
                          <pre className="text-xs overflow-auto max-h-32 text-muted-foreground">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Support message */}
              <div className="text-center text-sm text-muted-foreground">
                If this problem persists, please contact our support team with
                the error ID above.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;
  return WrappedComponent;
}

// Simple error fallback component
export function SimpleErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  return (
    <div className="text-center p-8">
      <h2 className="text-lg font-semibold text-red-600 mb-2">
        Something went wrong
      </h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={resetError} variant="outline">
        Try again
      </Button>
    </div>
  );
}

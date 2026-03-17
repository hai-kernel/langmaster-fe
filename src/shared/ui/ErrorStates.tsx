import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { 
  AlertCircle, 
  WifiOff, 
  ServerCrash, 
  ShieldAlert,
  RefreshCw,
  Home,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorStateProps {
  title: string;
  description: string;
  icon?: React.ElementType;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'destructive';
  }>;
}

export function ErrorState({ title, description, icon: Icon = AlertCircle, actions }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-[400px] p-8"
    >
      <Card className="max-w-md w-full p-8 text-center border-red-200 dark:border-red-900">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mb-6 inline-flex items-center justify-center size-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30"
        >
          <Icon className="size-10 text-red-600 dark:text-red-400" />
        </motion.div>

        <h3 className="text-xl font-semibold mb-2 text-red-900 dark:text-red-100">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>

        {actions && actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                className={action.variant === 'default' ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' : ''}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// Network error
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      icon={WifiOff}
      title="Connection Lost"
      description="Unable to connect to the server. Please check your internet connection and try again."
      actions={[
        {
          label: "Retry",
          onClick: onRetry || (() => window.location.reload()),
          variant: 'default'
        },
        {
          label: "Go Home",
          onClick: () => window.location.href = '/',
          variant: 'outline'
        }
      ]}
    />
  );
}

// Server error
export function ServerError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      icon={ServerCrash}
      title="Server Error"
      description="Something went wrong on our end. Our team has been notified and is working on a fix."
      actions={[
        {
          label: "Try Again",
          onClick: onRetry || (() => window.location.reload()),
          variant: 'default'
        },
        {
          label: "Go Back",
          onClick: () => window.history.back(),
          variant: 'outline'
        }
      ]}
    />
  );
}

// Permission error
export function PermissionError({ onGoBack }: { onGoBack?: () => void }) {
  return (
    <ErrorState
      icon={ShieldAlert}
      title="Access Denied"
      description="You don't have permission to access this page. Please contact your administrator if you believe this is an error."
      actions={[
        {
          label: "Go Home",
          onClick: () => window.location.href = '/',
          variant: 'default'
        },
        {
          label: "Go Back",
          onClick: onGoBack || (() => window.history.back()),
          variant: 'outline'
        }
      ]}
    />
  );
}

// 404 Not Found
export function NotFoundError() {
  return (
    <ErrorState
      icon={AlertCircle}
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      actions={[
        {
          label: "Go Home",
          onClick: () => window.location.href = '/',
          variant: 'default'
        },
        {
          label: "Go Back",
          onClick: () => window.history.back(),
          variant: 'outline'
        }
      ]}
    />
  );
}

// Inline error alert
export function InlineError({ 
  title, 
  message, 
  onDismiss,
  onRetry 
}: { 
  title?: string; 
  message: string; 
  onDismiss?: () => void;
  onRetry?: () => void;
}) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="size-4" />
      <AlertTitle>{title || "Error"}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        <div className="flex gap-2 ml-4">
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw className="size-3 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Error boundary fallback
export function ErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error; 
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-lg w-full p-8 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="mb-6 inline-flex items-center justify-center size-24 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30"
        >
          <AlertCircle className="size-12 text-red-600 dark:text-red-400" />
        </motion.div>

        <h1 className="text-2xl font-bold mb-2 text-red-900 dark:text-red-100">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          We encountered an unexpected error. Don't worry, it's not your fault!
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2">
              Error Details (Dev Only)
            </summary>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-40">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            onClick={resetErrorBoundary}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
          >
            <RefreshCw className="size-4 mr-2" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            <Home className="size-4 mr-2" />
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Toast error helper
export function showErrorToast(message: string, options?: any) {
  const { toast } = require('sonner');
  toast.error(message, {
    duration: 5000,
    ...options
  });
}

// Success toast helper
export function showSuccessToast(message: string, options?: any) {
  const { toast } = require('sonner');
  toast.success(message, {
    duration: 3000,
    ...options
  });
}

// Loading toast helper
export function showLoadingToast(message: string) {
  const { toast } = require('sonner');
  return toast.loading(message);
}

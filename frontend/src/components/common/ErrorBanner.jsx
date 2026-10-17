import React from 'react';
import { AlertCircle, RefreshCw, X, WifiOff } from 'lucide-react';
import Button from './Button';
import { API_BASE_URL } from '../../services/apiClient';

export const ErrorBanner = ({
  error,
  onRetry,
  onDismiss,
  title = 'Something went wrong',
  className = '',
}) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred.';
  const isNetwork = error?.isNetworkError || errorMessage.toLowerCase().includes('connect') || errorMessage.toLowerCase().includes('network');

  return (
    <div
      role="alert"
      className={`relative bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 sm:p-5 backdrop-blur-xl shadow-lg shadow-rose-950/20 animate-fade-in ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
          {isNetwork ? <WifiOff className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-rose-200 tracking-tight">
              {title}
            </h4>
            {onDismiss && (
              <button
                onClick={onDismiss}
                type="button"
                className="text-rose-400/80 hover:text-rose-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-xs text-rose-300/90 leading-relaxed">
            {errorMessage}
          </p>

          {isNetwork && (
            <p className="text-[11px] text-rose-400/80 mt-1 font-mono">
              💡 Tip: Confirm Spring Boot server is reachable at <code className="bg-rose-900/40 px-1 py-0.5 rounded text-rose-200">{API_BASE_URL}</code>.
            </p>
          )}

          {onRetry && (
            <div className="pt-2">
              <Button
                variant="danger"
                size="xs"
                icon={RefreshCw}
                onClick={onRetry}
              >
                Retry Request
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorBanner;

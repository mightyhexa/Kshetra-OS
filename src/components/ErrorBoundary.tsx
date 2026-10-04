import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  public handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 bg-rose-50 border border-rose-300 rounded-xl shadow-lg flex flex-col items-center justify-center text-center space-y-3 my-8">
          <div className="p-3 bg-rose-100 text-rose-700 rounded-full">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-base font-bold text-rose-950 font-serif">
              {this.props.fallbackTitle || 'Module Render Interrupted'}
            </h2>
            <p className="text-xs text-rose-800 mt-1 max-w-md leading-relaxed font-mono">
              {this.state.error?.message || 'An unexpected runtime error occurred in this section.'}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={this.handleReset}
              className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Module</span>
            </button>
            <button
              onClick={this.handleReload}
              className="px-3 py-1.5 bg-white border border-rose-300 text-rose-900 hover:bg-rose-100 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <span>Reload Screen</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

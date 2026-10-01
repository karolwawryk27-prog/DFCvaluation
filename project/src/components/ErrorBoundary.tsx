import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20">
              <AlertTriangle className="h-7 w-7 text-red-400" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-100">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              The dashboard hit an unexpected error while rendering the data.
              This can happen if the API returns incomplete or unexpected data for a ticker.
            </p>
            {this.state.error && (
              <pre className="mt-3 max-h-32 overflow-auto rounded-lg border border-slate-700/50 bg-slate-800/50 p-3 text-left text-xs text-red-300">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

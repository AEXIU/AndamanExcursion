import { Component, ErrorInfo, ReactNode } from 'react';
import styles from './FerrySearchErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class FerrySearchErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Ferry search error:', error, errorInfo);
    // Log to your error tracking service
    // Example: logErrorToService(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className={styles.ferryErrorFallback}>
          <div className={styles.errorContent}>
            <h2>Something went wrong with ferry search</h2>
            <p>We're experiencing technical difficulties. Please try again.</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className={styles.retryButton}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

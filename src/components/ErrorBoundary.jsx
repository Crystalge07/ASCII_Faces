import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fatal-error">
          <h1>Something went wrong</h1>
          <p>{this.state.error.message}</p>
          <p className="fatal-hint">
            Open the browser console for details, or restart with{' '}
            <code>npm run dev</code>.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

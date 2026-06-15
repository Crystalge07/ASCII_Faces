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
          <pre className="terminal-rule">{'!'.repeat(42)}</pre>
          <p>{'ERR: runtime failure'}</p>
          <p>{this.state.error.message}</p>
          <p className="fatal-hint">{'> reload the page or run npm run dev'}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

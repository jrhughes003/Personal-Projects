import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Changing this key clears a caught error, e.g. when the user switches screens. */
  resetKey?: string
}

interface State {
  error: Error | null
}

/** Keeps one broken screen from taking down the whole window. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Screen crashed', error, info.componentStack)
  }

  componentDidUpdate(prev: Props): void {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="error-screen panel" role="alert">
        <h2>Something went wrong on this screen</h2>
        <p className="muted">Your progress is saved. Try another screen from the sidebar, or reset this one.</p>
        <pre>{this.state.error.message}</pre>
        <button className="primary" onClick={() => this.setState({ error: null })}>
          Reset screen
        </button>
      </div>
    )
  }
}

import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <h1 className="font-serif text-2xl text-brand-dark mb-3">Something went wrong</h1>
            <p className="text-brand-text-light text-sm mb-6">
              An unexpected error occurred. Please try reloading the page.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Reload Page
              </button>
              <a href="/" className="btn-secondary">Go Home</a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || "Unknown error" };
  }

  componentDidCatch(error, errorInfo) {
    // Keep this for production debugging in browser console.
    // eslint-disable-next-line no-console
    console.error("UI crash caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "24px", textAlign: "center" }}>
          <h3>Something went wrong on this page.</h3>
          <p>Please refresh once. If it still fails, login again.</p>
          <p style={{ color: "#666", fontSize: "14px" }}>{this.state.errorMessage}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

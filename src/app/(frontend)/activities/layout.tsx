"use client";
import React from "react";

class ActivitiesErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
     
    console.error("Activities subtree crashed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2>Something went wrong.</h2>
          <p>Please try again or refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ActivitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ActivitiesErrorBoundary>{children}</ActivitiesErrorBoundary>;
}

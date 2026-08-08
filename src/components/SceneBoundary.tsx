import { Component, Suspense, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { failed: boolean };

/**
 * A phone too old for WebGL should still get the shop's phone number. The 3D
 * is decoration everywhere it appears, so failure degrades to nothing at all
 * rather than taking the page down with it.
 */
export default class SceneBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('3D scene unavailable, continuing without it.', error, info.componentStack);
  }

  render() {
    if (this.state.failed) return null;
    return <Suspense fallback={null}>{this.props.children}</Suspense>;
  }
}

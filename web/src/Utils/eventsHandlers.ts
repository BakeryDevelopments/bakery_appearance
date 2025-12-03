/**
 * Send a debug event (for development)
 * Uses postMessage to simulate NUI callbacks
 */
export function DebugEventSend<T = unknown>(event: string, data?: unknown): void {
  // Use postMessage to simulate NUI message
  window.postMessage({
    action: event,
    data: data
  }, '*');
}

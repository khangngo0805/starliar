export function OrderStatusBadge({ status }: { status: string }) {
  return <span className="status-badge">{status.replaceAll("_", " ")}</span>;
}

export default function StatusBadge({ status }: { status: string }) {
  if (status.includes('Done') || status === 'Sponsored') {
    return <span className="badge badge-success">{status}</span>
  }
  if (status === 'Partial') {
    return <span className="badge badge-warning">{status}</span>
  }
  if (status === 'No') {
    return <span className="badge badge-danger">{status}</span>
  }
  if (status === 'N/A') {
    return <span className="badge badge-info">{status}</span>
  }
  return <span className="badge badge-neutral">{status}</span>
}

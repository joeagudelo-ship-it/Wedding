export default function Card({ title, value, subtitle, accent }: { title: string; value: string | number; subtitle?: string; accent?: string }) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${accent || 'var(--primary)'}` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{title}</span>
      </div>
      <div className="text-2xl font-semibold peso" style={{ color: 'var(--text)' }}>{value}</div>
      {subtitle && <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>}
    </div>
  )
}

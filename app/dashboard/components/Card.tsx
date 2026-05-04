export default function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{title}</span>
        <span className="text-sm text-gray-500"></span>
      </div>
      <div className="mt-2">
        <span className="text-2xl font-semibold">{value}</span>
      </div>
    </div>
  )
}

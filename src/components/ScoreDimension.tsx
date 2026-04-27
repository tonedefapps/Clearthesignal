interface ScoreDimensionProps {
  label: string
  score: number
  description: string
}

export default function ScoreDimension({ label, score, description }: ScoreDimensionProps) {
  const pct = (score / 5) * 100
  const color =
    score >= 4 ? '#10b981' :
    score >= 3 ? '#f59e0b' :
    '#ef4444'

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-white/80">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{score.toFixed(1)}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-white/40">{description}</p>
    </div>
  )
}

import type { Stats } from '@/app/types/game';

interface Props {
  stats: Stats;
}

interface StatCell {
  label: string;
  value: string | number;
  barPct?: number;
  barColor?: string;
}

export default function StatsBar({ stats }: Props) {
  const cells: StatCell[] = [
    {
      label: '$',
      value: `$${stats.capital.toLocaleString()}`,
      barPct: Math.min(100, (stats.capital / 50000) * 100),
      barColor: 'linear-gradient(90deg, #00ffff, #ff00ff)',
    },
    {
      label: 'S',
      value: stats.sanity,
      barPct: stats.sanity,
      barColor: '#00ffff',
    },
    {
      label: 'P',
      value: stats.prestige,
      barPct: stats.prestige,
      barColor: '#ff00ff',
    },
    {
      label: 'STATUS',
      value: stats.status,
    },
  ];

  return (
    <div className="stats-bar">
      {cells.map((cell) => (
        <div key={cell.label} className="stat-cell">
          <span className="stat-label">{cell.label}</span>
          <span className="stat-value">{cell.value}</span>
          {cell.barPct !== undefined && (
            <div className="px-bar">
              <div
                className="px-fill"
                style={{
                  width: `${cell.barPct}%`,
                  background: cell.barColor,
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

import { FolderArchive, Plus } from 'lucide-react';

export function Logo({ small = false }: { small?: boolean }) {
  return (
    <img 
      className={small ? 'logo small-logo' : 'logo'} 
      src="/images/barangay-flores-seal.jpg" 
      alt="Sangguniang Barangay ng Flores seal" 
    />
  );
}

export function Empty({ title, add }: { title: string; add?: () => void }) {
  return (
    <div className="empty">
      <FolderArchive size={34} />
      <h3>{title}</h3>
      <p>Records will appear here once added.</p>
      {add && (
        <button onClick={add}>
          <Plus size={17} /> Create New Case
        </button>
      )}
    </div>
  );
}

// ============================================
// UPDATED STAT COMPONENT
// ============================================
export function Stat({ 
  label, 
  value, 
  subtitle, 
  trend 
}: { 
  label: string; 
  value: string | number; 
  subtitle?: string; 
  trend?: { value: number; label: string };
}) {
  return (
    <div className="stat">
      <p>{label}</p>
      <strong>{value}</strong>
      {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      {trend && (
        <span className={`stat-trend ${trend.value >= 0 ? 'positive' : 'negative'}`}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </span>
      )}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-table" aria-label="Loading records">
      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton-row" key={index}>
          <i /><i /><i /><i />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="skeleton-dashboard">
      <div className="skeleton-stats">
        <i /><i /><i />
      </div>
      <SkeletonTable rows={8} />
    </div>
  );
}
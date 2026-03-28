export default function DashboardLoading() {
  return (
    <div className="ui-customer-stack">
      {/* Page header skeleton */}
      <div>
        <div className="ui-skeleton-line" style={{ width: '14rem', height: '1.75rem', marginBottom: 'var(--space-3)' }} />
        <div className="ui-skeleton-line" style={{ width: '20rem', height: '0.875rem' }} />
      </div>

      {/* Stat cards skeleton */}
      <div className="ui-stat-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="ui-card" style={{ padding: 'var(--space-4)', minHeight: '5rem' }}>
            <div className="ui-skeleton-line" style={{ width: '60%', height: '0.7rem', marginBottom: 'var(--space-3)' }} />
            <div className="ui-skeleton-line" style={{ width: '40%', height: '2rem' }} />
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="ui-card" style={{ padding: 'var(--space-5)' }}>
        <div className="ui-skeleton-line" style={{ width: '10rem', height: '1.125rem', marginBottom: 'var(--space-4)' }} />
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {[7, 9, 6].map((w, i) => (
            <div
              key={i}
              className="ui-skeleton-block"
              style={{ width: `${w}rem`, height: '2.25rem' }}
            />
          ))}
        </div>
      </div>

      {/* Recent activity skeleton */}
      <div className="ui-card" style={{ padding: 'var(--space-5)' }}>
        <div className="ui-skeleton-line" style={{ width: '12rem', height: '1.125rem', marginBottom: 'var(--space-4)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[0.85, 0.7, 0.9].map((w, i) => (
            <div key={i} className="ui-skeleton-line" style={{ width: `${w * 100}%`, height: '0.875rem' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

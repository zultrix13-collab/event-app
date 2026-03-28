export default function ProgrammeLoading() {
  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto', padding: 'var(--space-4)' }}>
      {/* Header skeleton */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div className="ui-skeleton-line" style={{ width: '10rem', height: '1.75rem' }} />
        <div className="ui-skeleton-line" style={{ width: '8rem', height: '1rem' }} />
      </div>

      {/* Date tabs skeleton */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', overflow: 'hidden' }}>
        {[4, 4.5, 4].map((w, i) => (
          <div
            key={i}
            className="ui-skeleton-block"
            style={{ width: `${w}rem`, height: '2.25rem', borderRadius: 'var(--radius-full)', flexShrink: 0 }}
          />
        ))}
      </div>

      {/* Session card skeletons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="ui-card"
            style={{ padding: 'var(--space-4)', animationDelay: `${i * 0.08}s` }}
          >
            {/* Badges row */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <div className="ui-skeleton-block" style={{ width: '5rem', height: '1.25rem', borderRadius: 'var(--radius-sm)' }} />
              <div className="ui-skeleton-block" style={{ width: '4rem', height: '1.25rem', borderRadius: 'var(--radius-sm)' }} />
            </div>
            {/* Title */}
            <div className="ui-skeleton-line" style={{ width: '70%', height: '1.125rem', marginBottom: 'var(--space-2)' }} />
            {/* Time/venue */}
            <div className="ui-skeleton-line" style={{ width: '50%', height: '0.875rem', marginBottom: 'var(--space-3)' }} />
            {/* Capacity bar */}
            <div className="ui-skeleton-block" style={{ width: '100%', height: '0.375rem', borderRadius: 'var(--radius-full)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomeLoading() {
  return (
    <div style={{ maxWidth: '42rem', margin: '0 auto', padding: 'var(--space-4)' }}>
      {/* Skeleton greeting */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div
          className="ui-skeleton-line"
          style={{ width: '65%', height: '1.75rem', marginBottom: 'var(--space-3)' }}
        />
        <div className="ui-skeleton-line" style={{ width: '80%', height: '0.875rem' }} />
      </div>

      {/* Skeleton quick cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {[0.7, 0.85, 0.6, 0.9, 0.75, 0.65].map((w, i) => (
          <div
            key={i}
            className="ui-skeleton-block"
            style={{ height: '4.5rem', width: '100%', animationDelay: `${i * 0.06}s` }}
          />
        ))}
      </div>
    </div>
  );
}

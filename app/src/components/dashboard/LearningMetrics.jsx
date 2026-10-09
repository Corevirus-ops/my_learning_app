export default function LearningMetrics({ metrics }) {
    return (
        <section className="metrics-grid" aria-label="Learning summary">
            {metrics.map((metric) => (
                <article className="metric-card" key={metric.label}>
                    <div>
                        <p className="metric-label">{metric.label}</p>
                        <strong>{metric.value}</strong>
                        <p className="metric-note">{metric.note}</p>
                    </div>
                    <span className={`metric-icon ${metric.tone}`} aria-hidden="true">{metric.icon}</span>
                </article>
            ))}
        </section>
    );
}
export default function CourseProgressPanel({ completionPercent, completedCount, courseCount, plannedHours, labels }) {
    return (
        <section className="weekly-card">
            <span className="weekly-spark" aria-hidden="true">✦</span>
            <p className="weekly-eyebrow">COURSE OVERVIEW</p>
            <h2>Your learning progress</h2>
            <div className="goal-summary">
                <div className="goal-ring" style={{ background: `conic-gradient(#8bcbb0 0 ${completionPercent}%, #35423c ${completionPercent}% 100%)` }}>
                    <strong>{completionPercent}<small>%</small></strong>
                </div>
                <div>
                    <p><strong>{completedCount}</strong> of <strong>{courseCount}</strong> courses completed.</p>
                    <span>{plannedHours} planned learning hours</span>
                </div>
            </div>
            <div className="course-labels">
                <p>Focus areas</p>
                {labels.length
                    ? labels.slice(0, 6).map((label) => <span className="course-label" key={label}>{label}</span>)
                    : <small>Add labels to your courses to see focus areas.</small>}
            </div>
        </section>
    );
}
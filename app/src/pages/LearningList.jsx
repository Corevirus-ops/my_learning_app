import './LearningList.css';

const sampleCourses = [
    {
        id: 1,
        initials: 'TS',
        tone: 'coral',
        title: 'Advanced TypeScript Patterns',
        kind: 'Guide',
        domain: 'typescriptlang.org',
        hours: 6,
        progress: 72,
        labels: ['TypeScript', 'JavaScript'],
        link: 'https://www.typescriptlang.org/',
    },
    {
        id: 2,
        initials: 'SD',
        tone: 'blue',
        title: 'System Design Primer',
        kind: 'Project',
        domain: 'github.com',
        hours: 12,
        progress: 48,
        labels: ['System design', 'APIs'],
        link: 'https://github.com/donnemartin/system-design-primer',
    },
    {
        id: 3,
        initials: 'DV',
        tone: 'lilac',
        title: 'Data Visualization Fundamentals',
        kind: 'Notebook',
        domain: 'observablehq.com',
        hours: 8,
        progress: 91,
        labels: ['D3.js', 'Data visualization'],
        link: 'https://observablehq.com/',
    },
];

function LearningItem({ course }) {
    return (
        <article className="saved-course">
            <span className="saved-course-select" aria-hidden="true" />
            <span className={`saved-course-avatar ${course.tone}`}>{course.initials}</span>
            <div className="saved-course-main">
                <a className="saved-course-title" href={course.link} target="_blank" rel="noreferrer">{course.title}</a>
                <p className="saved-course-meta">{course.kind} · {course.domain}</p>
                <div className="saved-course-labels">
                    {course.labels.map((label) => <span key={label}>{label}</span>)}
                </div>
                <div className="saved-course-progress" aria-label={`${course.progress}% complete`}>
                    <span style={{ width: `${course.progress}%` }} />
                </div>
            </div>
            <div className="saved-course-data">
                <span><strong>{course.hours}</strong><small>h</small></span>
                <span><strong>{course.progress}</strong><small>%</small></span>
                <a href={course.link} target="_blank" rel="noreferrer">Open link <span aria-hidden="true">→</span></a>
            </div>
        </article>
    );
}

export default function LearningList() {
    return (
        <div className="learning-page">
            <header className="learning-page-heading">
                <p className="eyebrow">YOUR QUEUE</p>
                <h1>Learning list</h1>
                <p>Save anything you want to learn and check it off when you’re done.</p>
            </header>

            <form className="learning-entry" onSubmit={(event) => event.preventDefault()}>
                <label className="visually-hidden" htmlFor="course-title">Course title</label>
                <input id="course-title" type="text" placeholder="What do you want to learn?" />
                <label className="visually-hidden" htmlFor="course-link">Course link</label>
                <input id="course-link" type="url" placeholder="Paste a link from anywhere" />
                <label className="entry-number">
                    <input type="number" min="0" aria-label="Planned hours" placeholder="0" />
                    <span>hours</span>
                </label>
                <label className="entry-number entry-percent">
                    <input type="number" min="0" max="100" aria-label="Progress percentage" placeholder="0" />
                    <span>%</span>
                </label>
                <label className="visually-hidden" htmlFor="course-labels">Skills and topics</label>
                <input id="course-labels" className="entry-labels" type="text" placeholder="Skills, comma separated (JavaScript, OpenShift)" />
                <button type="button" className="entry-submit">Add to list</button>
                <p className="entry-hint">Add as many skills as you need, separated by commas. Hours and progress can be updated later.</p>
            </form>

            <section className="learning-collection" aria-label="Saved learning items">
                <div className="collection-stats">
                    <article><span>Total planned</span><strong>26.0h</strong></article>
                    <article><span>Est. completed</span><strong>17.4h</strong></article>
                    <article><span>Est. remaining</span><strong>8.6h</strong></article>
                </div>

                <div className="collection-heading">
                    <div>
                        <h2>{sampleCourses.length} saved items</h2>
                        <p>0 completed · {sampleCourses.length} still learning</p>
                    </div>
                    <div className="collection-filters" aria-label="Filter courses">
                        <button type="button" className="filter-active">All</button>
                        <button type="button">Active</button>
                        <button type="button">Done</button>
                    </div>
                </div>

                <div className="saved-course-list">
                    {sampleCourses.map((course) => <LearningItem key={course.id} course={course} />)}
                </div>
            </section>
        </div>
    );
}
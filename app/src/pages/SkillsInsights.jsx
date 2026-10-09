import { getLearningInsights } from '../services/learningService';
import { useLearningResource } from '../hooks/useLearningResource';
import './SkillsInsights.css';

const initialInsights = {
    course_count: 0,
    completed_count: 0,
    planned_hours: 0,
    average_progress: 0,
    skills: [],
    recently_updated: [],
};

function formatDate(value) {
    if (!value) return 'No recent update';
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SkillsInsights() {
    const { user, data, status, error } = useLearningResource(getLearningInsights, initialInsights);

    return (
        <div className="feature-page insights-page">
            <header className="feature-page-heading">
                <p className="eyebrow">YOUR GROWTH</p>
                <h1>Skills &amp; insights</h1>
                <p>See the skills you’re building and where your learning time is focused.</p>
            </header>

            {!user && <p className="insights-message">Sign in to see your learning insights.</p>}
            {user && status === 'loading' && <p className="insights-message">Gathering your learning data...</p>}
            {user && status === 'failed' && <p className="insights-message insights-error" role="alert">{error}</p>}
            {user && status === 'succeeded' && <>
                <section className="insights-summary" aria-label="Learning summary">
                    <article><span>Skills in progress</span><strong>{data.skills.length}</strong><small>Unique topics across your list</small></article>
                    <article><span>Average progress</span><strong>{data.average_progress}%</strong><small>Across {data.course_count} courses</small></article>
                    <article><span>Courses completed</span><strong>{data.completed_count}</strong><small>{data.planned_hours} planned learning hours</small></article>
                </section>

                {data.course_count === 0 ? <section className="insights-empty">
                    <h2>Your skill map starts with a course</h2>
                    <p>Add courses and label the skills you’re practicing. Your progress will appear here.</p>
                </section> : <div className="insights-columns">
                    <section className="insights-panel skills-panel">
                        <div className="insights-panel-heading">
                            <div><h2>Skill map</h2><p>Progress is averaged across courses tagged with each skill.</p></div>
                            <span>{data.skills.length} tracked</span>
                        </div>
                        {data.skills.length ? <div className="skill-insight-list">
                            {data.skills.map((skill, index) => (
                                <article className="skill-insight" key={skill.name}>
                                    <span className={`skill-rank rank-${index % 4}`}>{String(index + 1).padStart(2, '0')}</span>
                                    <div className="skill-insight-main">
                                        <div className="skill-insight-title"><strong>{skill.name}</strong><span>{skill.course_count} {skill.course_count === 1 ? 'course' : 'courses'}</span></div>
                                        <div className="skill-progress-track"><span style={{ width: `${skill.average_progress}%` }} /></div>
                                    </div>
                                    <strong className="skill-percent">{skill.average_progress}%</strong>
                                </article>
                            ))}
                        </div> : <p className="insights-muted">Add labels to your courses to build your skill map.</p>}
                    </section>

                    <section className="insights-panel recent-panel">
                        <div className="insights-panel-heading">
                            <div><h2>Recently updated</h2><p>Your most recently changed courses</p></div>
                        </div>
                        <div className="recent-course-list">
                            {data.recently_updated.map((course) => <article className="recent-course" key={course.id}>
                                <div><strong>{course.title}</strong><span>{Number(course.progress ?? (course.completed ? 100 : 0))}% complete</span></div>
                                <time dateTime={course.updated_at}>{formatDate(course.updated_at)}</time>
                            </article>)}
                        </div>
                    </section>
                </div>}
            </>}
        </div>
    );
}
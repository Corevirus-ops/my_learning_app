import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCourses, fetchCourses } from '../components/courseSlice';
import './Home.css';

const tones = ['coral', 'blue', 'lilac', 'mint'];

function getInitials(title = '') {
    return title.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'LC';
}

function getCourseDomain(link) {
    try {
        return new URL(link).hostname.replace(/^www\./, '');
    } catch {
        return '';
    }
}

function getCourseProgress(course) {
    return Number(course.progress ?? (course.completed ? 100 : 0)) || 0;
}

export default function Home() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const { courses, status, error } = useSelector((state) => state.courses);
    const firstName = user?.username?.split(/[\s._-]/)[0] || 'there';
    const today = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

    useEffect(() => {
        if (!user) {
            dispatch(clearCourses());
            return undefined;
        }

        const request = dispatch(fetchCourses());
        return () => request.abort();
    }, [dispatch, user]);

    const completedCount = courses.filter((course) => getCourseProgress(course) >= 100).length;
    const activeCount = courses.length - completedCount;
    const plannedHours = courses.reduce((total, course) => total + (Number(course.hours_to_complete) || 0), 0);
    const completionPercent = courses.length
        ? Math.round(courses.reduce((total, course) => total + getCourseProgress(course), 0) / courses.length)
        : 0;
    const labels = [...new Set(courses.flatMap((course) => Array.isArray(course.labels) ? course.labels : [])
        .filter((label) => typeof label === 'string' && label.trim())
        .map((label) => label.trim()))];
    const metrics = [
        { label: 'Hours planned', value: `${plannedHours}h`, note: `Across ${courses.length} ${courses.length === 1 ? 'course' : 'courses'}`, icon: '◷', tone: 'mint' },
        { label: 'Overall progress', value: `${completionPercent}%`, note: `${completedCount} of ${courses.length} completed`, icon: '▥', tone: 'lilac' },
        { label: 'Skills tracked', value: labels.length, note: 'From your course labels', icon: '▤', tone: 'blue' },
        { label: 'Courses completed', value: completedCount, note: `${activeCount} in progress`, icon: '✓', tone: 'coral' },
    ];

    return (
        <div className="dashboard">
            <section className="welcome-row">
                <div>
                    <p className="eyebrow">{today}</p>
                    <h1>Welcome back, {firstName}</h1>
                    <p className="welcome-copy">Everything you want to learn, organized in one place.</p>
                </div>
                <p className="in-progress"><span />{activeCount} {activeCount === 1 ? 'course' : 'courses'} in progress</p>
            </section>

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

            <div className="dashboard-grid">
                <section className="up-next panel">
                    <div className="panel-heading">
                        <div><h2>Your courses</h2><p>Every course in your learning list</p></div>
                        <span className="panel-count">{courses.length} total</span>
                    </div>
                    <div className="learning-list">
                        {status === 'loading' && <p className="course-message">Loading your courses...</p>}
                        {status === 'failed' && <p className="course-message course-error" role="alert">{error || 'Could not load your courses.'}</p>}
                        {status === 'succeeded' && courses.length === 0 && <p className="course-message">No courses yet. Add a learning link to get started.</p>}
                        {courses.map((course, index) => {
                            const detail = [
                                getCourseDomain(course.course_link),
                                course.hours_to_complete ? `${course.hours_to_complete}h planned` : '',
                                course.description,
                            ].filter(Boolean).join(' · ');
                            const progress = getCourseProgress(course);

                            return (
                            <article className="learning-item" key={course.id}>
                                <span className={`item-avatar ${tones[index % tones.length]}`}>{getInitials(course.title)}</span>
                                <div className="item-content">
                                    <div className="item-topline">
                                        <strong>{course.course_link ? <a href={course.course_link} target="_blank" rel="noreferrer">{course.title}</a> : course.title}</strong>
                                        <span>{progress >= 100 ? 'Completed' : `${progress}% complete`}</span>
                                    </div>
                                    <p>{detail || 'No course details provided'}</p>
                                    <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
                                </div>
                                {course.completed && <span className="item-check" aria-label="Completed">✓</span>}
                            </article>
                            );
                        })}
                    </div>
                </section>

                <section className="weekly-card">
                    <span className="weekly-spark" aria-hidden="true">✦</span>
                    <p className="weekly-eyebrow">COURSE OVERVIEW</p>
                    <h2>Your learning progress</h2>
                    <div className="goal-summary">
                        <div className="goal-ring" style={{ background: `conic-gradient(#8bcbb0 0 ${completionPercent}%, #35423c ${completionPercent}% 100%)` }}><strong>{completionPercent}<small>%</small></strong></div>
                        <div><p><strong>{completedCount}</strong> of <strong>{courses.length}</strong> courses completed.</p><span>{plannedHours} planned learning hours</span></div>
                    </div>
                    <div className="course-labels">
                        <p>Focus areas</p>
                        {labels.length ? labels.slice(0, 6).map((label) => <span className="course-label" key={label}>{label}</span>) : <small>Add labels to your courses to see focus areas.</small>}
                    </div>
                </section>
            </div>
        </div>
    )
}
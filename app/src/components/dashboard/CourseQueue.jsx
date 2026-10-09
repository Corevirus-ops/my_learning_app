import { getCourseDomain, getCourseInitials, getCourseProgress } from '../../utils/courseUtils';

const tones = ['coral', 'blue', 'lilac', 'mint'];

export default function CourseQueue({ courses, status, error }) {
    return (
        <section className="up-next panel">
            <div className="panel-heading">
                <div><h2>Your courses</h2><p>Every course in your learning list</p></div>
                <span className="panel-count">{courses.length} total</span>
            </div>
            <div className="learning-list">
                {status === 'loading' && courses.length === 0 && <p className="course-message">Loading your courses...</p>}
                {status === 'failed' && <p className="course-message course-error" role="alert">{error || 'Could not load your courses.'}</p>}
                {status === 'succeeded' && courses.length === 0 && <p className="course-message">No courses yet. Add a learning link to get started.</p>}
                {courses.map((course, index) => {
                    const progress = getCourseProgress(course);
                    const detail = [
                        getCourseDomain(course.course_link),
                        course.hours_to_complete ? `${course.hours_to_complete}h planned` : '',
                    ].filter(Boolean).join(' · ');

                    return (
                        <article className="learning-item" key={course.id}>
                            <span className={`item-avatar ${tones[index % tones.length]}`}>{getCourseInitials(course.title)}</span>
                            <div className="item-content">
                                <div className="item-topline">
                                    <strong>{course.course_link ? <a href={course.course_link} target="_blank" rel="noreferrer">{course.title}</a> : course.title}</strong>
                                    <span>{progress >= 100 ? 'Completed' : `${progress}% complete`}</span>
                                </div>
                                <p className="overview-course-meta">{detail || 'No course link provided'}</p>
                                {course.description && <p className="overview-course-description">{course.description}</p>}
                                <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
                            </div>
                            {progress >= 100 && <span className="item-check" aria-label="Completed">✓</span>}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
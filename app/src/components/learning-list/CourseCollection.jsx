import { useState } from 'react';
import { getCourseProgress } from '../../utils/courseUtils';
import CourseCard from './CourseCard';

const filters = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'done', label: 'Done' },
];

export default function CourseCollection({ user, courses, status, error, saveStatuses, onFieldChange, onSave, onDelete }) {
    const [filter, setFilter] = useState('all');
    const totalHours = courses.reduce((total, course) => total + (Number(course.hours_to_complete) || 0), 0);
    const completedHours = courses.reduce((total, course) => total + (Number(course.hours_to_complete) || 0) * getCourseProgress(course) / 100, 0);
    const completedCount = courses.filter((course) => getCourseProgress(course) >= 100).length;
    const visibleCourses = courses.filter((course) => {
        if (filter === 'active') return getCourseProgress(course) < 100;
        if (filter === 'done') return getCourseProgress(course) >= 100;
        return true;
    });

    return (
        <section className="learning-collection" aria-label="Saved learning items">
            <div className="collection-stats">
                <article><span>Total planned</span><strong>{totalHours.toFixed(1)}h</strong></article>
                <article><span>Est. completed</span><strong>{completedHours.toFixed(1)}h</strong></article>
                <article><span>Est. remaining</span><strong>{Math.max(0, totalHours - completedHours).toFixed(1)}h</strong></article>
            </div>

            <div className="collection-heading">
                <div>
                    <h2>{courses.length} saved {courses.length === 1 ? 'item' : 'items'}</h2>
                    <p>{completedCount} completed · {courses.length - completedCount} still learning</p>
                </div>
                <div className="collection-filters" aria-label="Filter courses">
                    {filters.map((option) => <button key={option.id} type="button" className={filter === option.id ? 'filter-active' : ''} aria-pressed={filter === option.id} onClick={() => setFilter(option.id)}>{option.label}</button>)}
                </div>
            </div>

            <div className="saved-course-list">
                {!user && <p className="course-list-message">Sign in to see and manage your learning list.</p>}
                {status === 'loading' && courses.length === 0 && <p className="course-list-message">Loading your courses...</p>}
                {status === 'failed' && <p className="course-list-message course-list-error" role="alert">{error || 'Could not load your courses.'}</p>}
                {status === 'succeeded' && courses.length === 0 && <p className="course-list-message">No saved courses yet. Add your first one above.</p>}
                {visibleCourses.map((course, index) => (
                    <CourseCard
                        key={course.id}
                        course={course}
                        index={index}
                        saveStatus={saveStatuses[course.id]}
                        onFieldChange={onFieldChange}
                        onSave={onSave}
                        onDelete={onDelete}
                    />
                ))}
                {status === 'succeeded' && courses.length > 0 && visibleCourses.length === 0 && <p className="course-list-message">No courses in this filter.</p>}
            </div>
        </section>
    );
}
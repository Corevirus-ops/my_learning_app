import { useState } from 'react';
import { getLearningHistory } from '../services/learningService';
import { useLearningResource } from '../hooks/useLearningResource';
import './LearningHistory.css';

const initialHistory = { activities: [], timezone: 'UTC' };
const filters = [
    { id: 'all', label: 'All activity' },
    { id: 'course_added', label: 'Added' },
    { id: 'progress_updated', label: 'Progress' },
    { id: 'course_completed', label: 'Completed' },
];

const activityCopy = {
    course_added: { label: 'Added to your list', icon: '+' },
    course_updated: { label: 'Updated course details', icon: '↻' },
    progress_updated: { label: 'Made progress', icon: '↗' },
    course_completed: { label: 'Course completed', icon: '✓' },
    course_deleted: { label: 'Removed from your list', icon: '−' },
};

function getDateKey(dateValue, timezone) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date(dateValue));
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${values.year}-${values.month}-${values.day}`;
}

function formatDay(dateValue, timezone) {
    const date = new Date(dateValue);
    const today = getDateKey(new Date(), timezone);
    const yesterdayDate = new Date(`${today}T00:00:00.000Z`);
    yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
    const yesterday = yesterdayDate.toISOString().slice(0, 10);
    const dateKey = getDateKey(date, timezone);
    if (dateKey === today) return 'Today';
    if (dateKey === yesterday) return 'Yesterday';
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', timeZone: timezone });
}

function formatTime(dateValue, timezone) {
    return new Date(dateValue).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZone: timezone });
}

function describeActivity(activity) {
    if (activity.activity_type === 'progress_updated' || activity.activity_type === 'course_completed') {
        const previous = activity.details?.previous_progress;
        if (previous !== undefined && activity.progress !== null) return `${previous}% → ${activity.progress}%`;
        if (activity.progress !== null) return `${activity.progress}% complete`;
    }
    if (activity.activity_type === 'course_updated' && activity.details?.updated_fields?.length) {
        return `Changed ${activity.details.updated_fields.join(', ').replaceAll('_', ' ')}`;
    }
    return '';
}

export default function LearningHistory() {
    const { user, data, status, error } = useLearningResource(getLearningHistory, initialHistory);
    const [filter, setFilter] = useState('all');
    const activities = data.activities || [];
    const filteredActivities = activities.filter((activity) => filter === 'all' || activity.activity_type === filter);
    const groups = filteredActivities.reduce((result, activity) => {
        const day = formatDay(activity.created_at, data.timezone || 'UTC');
        if (!result.length || result[result.length - 1].day !== day) result.push({ day, activities: [] });
        result[result.length - 1].activities.push(activity);
        return result;
    }, []);

    return (
        <div className="feature-page history-page">
            <header className="feature-page-heading">
                <p className="eyebrow">YOUR LEARNING JOURNAL</p>
                <h1>Learning history</h1>
                <p>A timeline of the courses you add, update, and complete.</p>
            </header>

            <section className="history-panel" aria-label="Learning activity history">
                <div className="history-toolbar">
                    <div><h2>Recent activity</h2><p>{activities.length} most recent updates</p></div>
                    <div className="history-filters" aria-label="Filter activity">
                        {filters.map((option) => <button key={option.id} type="button" className={filter === option.id ? 'selected' : ''} aria-pressed={filter === option.id} onClick={() => setFilter(option.id)}>{option.label}</button>)}
                    </div>
                </div>

                {!user && <p className="history-message">Sign in to view your learning history.</p>}
                {user && status === 'loading' && <p className="history-message">Loading your learning history...</p>}
                {user && status === 'failed' && <p className="history-message history-error" role="alert">{error}</p>}
                {user && status === 'succeeded' && !activities.length && <p className="history-message">Your timeline starts when you add or update a course.</p>}
                {user && status === 'succeeded' && activities.length > 0 && !filteredActivities.length && <p className="history-message">No activity matches this filter.</p>}

                <div className="history-groups">
                    {groups.map((group) => (
                        <section className="history-day" key={group.day}>
                            <h3>{group.day}</h3>
                            <div className="history-events">
                                {group.activities.map((activity) => {
                                    const copy = activityCopy[activity.activity_type] || activityCopy.course_updated;
                                    return (
                                        <article className={`history-event event-${activity.activity_type}`} key={activity.id}>
                                            <span className="history-event-icon" aria-hidden="true">{copy.icon}</span>
                                            <div className="history-event-copy">
                                                <strong>{activity.course_title}</strong>
                                                <p>{copy.label}{describeActivity(activity) ? ` · ${describeActivity(activity)}` : ''}</p>
                                            </div>
                                            <time dateTime={activity.created_at}>{formatTime(activity.created_at, data.timezone || 'UTC')}</time>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            </section>
        </div>
    );
}
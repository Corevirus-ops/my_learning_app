import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLearningResource } from '../../hooks/useLearningResource';
import { getLearningHistory } from '../../services/learningService';

const initialHistory = { activities: [], timezone: 'UTC' };

const activityLabels = {
    course_added: 'Added to your list',
    course_updated: 'Course details updated',
    progress_updated: 'Learning progress updated',
    course_completed: 'Course completed',
    course_deleted: 'Course removed',
};

function isNewerActivity(activityId, seenId) {
    try {
        return BigInt(activityId) > BigInt(seenId || 0);
    } catch {
        return Number(activityId) > Number(seenId || 0);
    }
}

function formatNotificationTime(value, timezone) {
    return new Date(value).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: timezone,
    });
}

export default function LearningNotifications() {
    const { user, data, status } = useLearningResource(getLearningHistory, initialHistory);
    const [isOpen, setIsOpen] = useState(false);
    const [lastSeenId, setLastSeenId] = useState('0');
    const activities = data.activities || [];
    const storageKey = user ? `learning-notifications-seen-${user.id}` : null;
    const unreadCount = activities.filter((activity) => isNewerActivity(activity.id, lastSeenId)).length;

    useEffect(() => {
        if (!storageKey || status !== 'succeeded') return;
        const storedId = localStorage.getItem(storageKey);
        if (storedId !== null) {
            setLastSeenId(storedId);
            return;
        }

        const newestId = String(activities[0]?.id || 0);
        localStorage.setItem(storageKey, newestId);
        setLastSeenId(newestId);
    }, [activities, status, storageKey]);

    const handleToggle = () => {
        const willOpen = !isOpen;
        setIsOpen(willOpen);
        if (willOpen && storageKey && activities.length) {
            const newestId = String(activities[0].id);
            localStorage.setItem(storageKey, newestId);
            setLastSeenId(newestId);
        }
    };

    return (
        <div className="notification-wrap">
            <button
                className="notification-button"
                type="button"
                aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                aria-expanded={isOpen}
                aria-controls="learning-notifications-panel"
                title="Notifications"
                onClick={handleToggle}
            >
                <span aria-hidden="true">♧</span>
                {unreadCount > 0 && <i aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</i>}
            </button>
            {isOpen && <section className="notification-panel" id="learning-notifications-panel" aria-label="Recent notifications">
                <header className="notification-panel-heading">
                    <div><h2>Notifications</h2><p>{unreadCount ? `${unreadCount} new updates` : 'You’re all caught up'}</p></div>
                    <button type="button" aria-label="Close notifications" onClick={() => setIsOpen(false)}>×</button>
                </header>
                <div className="notification-list">
                    {status === 'loading' && <p className="notification-empty">Loading recent activity...</p>}
                    {status === 'failed' && <p className="notification-empty">Could not load recent activity.</p>}
                    {status === 'succeeded' && !activities.length && <p className="notification-empty">Course updates will show up here.</p>}
                    {activities.slice(0, 5).map((activity) => <article className="notification-item" key={activity.id}>
                        <span className={`notification-item-icon notification-${activity.activity_type}`} aria-hidden="true">{activity.activity_type === 'course_completed' ? '✓' : activity.activity_type === 'course_added' ? '+' : '↗'}</span>
                        <div><strong>{activity.course_title}</strong><p>{activityLabels[activity.activity_type] || 'Learning activity'}</p><time dateTime={activity.created_at}>{formatNotificationTime(activity.created_at, data.timezone || 'UTC')}</time></div>
                    </article>)}
                </div>
                <Link className="notification-view-all" to="/learning-history" onClick={() => setIsOpen(false)}>View all activity <span aria-hidden="true">→</span></Link>
            </section>}
        </div>
    );
}
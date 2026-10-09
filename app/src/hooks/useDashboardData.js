import { useCourseData } from './useCourseData';
import { getCourseProgress } from '../utils/courseUtils';

export function useDashboardData() {
    const { user, courses, status, error } = useCourseData();
    const firstName = user?.username?.split(/[\s._-]/)[0] || 'there';
    const today = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    }).format(new Date());
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

    return {
        firstName,
        today,
        courses,
        status,
        error,
        completedCount,
        activeCount,
        plannedHours,
        completionPercent,
        labels,
        metrics,
    };
}
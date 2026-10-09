export function normalizeHours(value) {
    const hours = Number(value);
    return Number.isFinite(hours) ? Math.max(1, Math.ceil(hours)) : 1;
}

export function getCourseProgress(course) {
    return Number(course.progress ?? (course.completed ? 100 : 0)) || 0;
}

export function getCourseInitials(title = '') {
    return title.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'LC';
}

export function getCourseDomain(link) {
    try {
        return new URL(link).hostname.replace(/^www\./, '');
    } catch {
        return link || 'No link provided';
    }
}

export function parseCourseLabels(labels = '') {
    return labels.split(',').map((label) => label.trim()).filter(Boolean);
}
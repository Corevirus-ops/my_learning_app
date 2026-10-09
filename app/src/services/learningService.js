const learningUrl = `${import.meta.env.VITE_SERVER}/learning`;

function notifyLearningDataChanged() {
    window.dispatchEvent(new Event('learning-data-changed'));
}

async function requestLearningApi(path, { method = 'GET', body, signal, headers = {} } = {}) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Sign in to view your learning data.');

    const response = await fetch(`${learningUrl}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            ...headers,
            ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        credentials: 'include',
        signal,
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json();

    if (!response.ok) {
        if (Array.isArray(data.errors)) {
            throw new Error(data.errors.map((error) => error.msg).filter(Boolean).join(' '));
        }
        throw new Error(data.message || 'The request could not be completed.');
    }

    return data;
}

export function getLearningSummary({ signal } = {}) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    return requestLearningApi('/summary', { signal, headers: { 'X-Timezone': timezone } });
}

export function getLearningHistory({ signal, limit = 50 } = {}) {
    return requestLearningApi(`/history?limit=${limit}`, { signal });
}

export function getLearningInsights({ signal } = {}) {
    return requestLearningApi('/insights', { signal });
}

export function getLearningSettings({ signal } = {}) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    return requestLearningApi('/settings', { signal, headers: { 'X-Timezone': timezone } });
}

export function saveLearningSettings(settings) {
    return requestLearningApi('/settings', { method: 'PUT', body: settings }).then((data) => {
        notifyLearningDataChanged();
        return data;
    });
}
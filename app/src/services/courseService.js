const coursesUrl = `${import.meta.env.VITE_SERVER}/courses`;

async function requestCoursesApi(path, { method = 'GET', body, signal } = {}) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Sign in to manage your courses.');

    const response = await fetch(`${coursesUrl}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        credentials: 'include',
        signal,
        ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = response.status === 204 ? null : await response.json();

    if (!response.ok) {
        if (Array.isArray(data?.errors)) {
            throw new Error(data.errors.map((error) => error.msg).filter(Boolean).join(' '));
        }
        throw new Error(data?.message || 'The request could not be completed.');
    }

    return data;
}

export async function listCourses({ signal } = {}) {
    const data = await requestCoursesApi('', { signal });
    if (!Array.isArray(data?.courses)) {
        throw new Error('The server returned an unexpected courses response.');
    }
    return data.courses;
}

export async function createCourse(course) {
    const data = await requestCoursesApi('', { method: 'POST', body: course });
    return data.course;
}

export async function updateCourseOnServer(course) {
    const data = await requestCoursesApi(`/${course.id}`, {
        method: 'PUT',
        body: {
            title: course.title,
            description: course.description || '',
            hours_to_complete: Number(course.hours_to_complete),
            course_link: course.course_link,
            labels: Array.isArray(course.labels) ? course.labels : [],
            progress: Number(course.progress),
        },
    });
    return data.course;
}

export async function deleteCourseFromServer(courseId) {
    await requestCoursesApi(`/${courseId}`, { method: 'DELETE' });
}
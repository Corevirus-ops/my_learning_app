import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCourse, clearCourses, fetchCourses, removeCourse, updateCourse } from '../components/courseSlice';
import { skillCatalog } from '../data/skillCatalog';
import './LearningList.css';

const SAVE_DELAY_MS = 2000;
const tones = ['coral', 'blue', 'lilac', 'mint'];
const popularSkills = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git & GitHub', 'REST APIs', 'Testing'];
const initialForm = { title: '', link: '', hours: '1', progress: '0', labels: '' };

function normalizeHours(value) {
    const hours = Number(value);
    return Number.isFinite(hours) ? Math.max(1, Math.ceil(hours)) : 1;
}

function getCourseProgress(course) {
    return Number(course.progress ?? (course.completed ? 100 : 0)) || 0;
}

function getInitials(title = '') {
    return title.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'LC';
}

function getDomain(link) {
    try {
        return new URL(link).hostname.replace(/^www\./, '');
    } catch {
        return link || 'No link provided';
    }
}

function getResponseError(data) {
    if (Array.isArray(data.errors)) {
        return data.errors.map((error) => error.msg).filter(Boolean).join(' ');
    }
    return data.message || 'The request could not be completed.';
}

async function persistCourse(course) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Sign in to save course changes.');

    const response = await fetch(`${import.meta.env.VITE_SERVER}/courses/${course.id}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            title: course.title,
            description: course.description || '',
            hours_to_complete: Number(course.hours_to_complete),
            course_link: course.course_link,
            labels: Array.isArray(course.labels) ? course.labels : [],
            progress: Number(course.progress),
        }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(getResponseError(data));
    return data.course;
}

function CourseEditForm({ course, form, isSaving, onChange, onSubmit, onCancel }) {
    return (
        <form className="course-edit-panel" onSubmit={(event) => onSubmit(event, course)}>
            <label>
                <span>Title</span>
                <input type="text" maxLength="100" value={form.title} onChange={(event) => onChange('title', event.target.value)} disabled={isSaving} required />
            </label>
            <label>
                <span>Link</span>
                <input type="url" maxLength="255" value={form.link} onChange={(event) => onChange('link', event.target.value)} disabled={isSaving} required />
            </label>
            <label className="course-edit-description">
                <span>Description</span>
                <textarea rows="2" value={form.description} onChange={(event) => onChange('description', event.target.value)} disabled={isSaving} />
            </label>
            <label>
                <span>Planned hours</span>
                <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.hours}
                    onChange={(event) => onChange('hours', event.target.value)}
                    onBlur={(event) => onChange('hours', String(normalizeHours(event.target.value)))}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            event.currentTarget.blur();
                        }
                    }}
                    disabled={isSaving}
                    required
                />
            </label>
            <label>
                <span>Progress (%)</span>
                <input type="number" min="0" max="100" step="1" value={form.progress} onChange={(event) => onChange('progress', event.target.value)} disabled={isSaving} required />
            </label>
            <label className="course-edit-labels">
                <span>Skills and topics</span>
                <input type="text" value={form.labels} onChange={(event) => onChange('labels', event.target.value)} placeholder="Comma-separated skills" disabled={isSaving} />
            </label>
            <div className="course-edit-actions">
                <button type="button" className="course-cancel-button" onClick={onCancel} disabled={isSaving}>Cancel</button>
                <button type="submit" className="course-save-button" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save changes'}</button>
            </div>
        </form>
    );
}

function LearningItem({ course, index, saveStatus, editForm, isEditing, isSaving, isDeleting, onChange, onEdit, onDelete, onEditChange, onEditSubmit, onCancelEdit }) {
    const progress = getCourseProgress(course);
    const completed = progress >= 100;

    return (
        <article className={`saved-course${completed ? ' completed-course' : ''}`}>
            <span className="saved-course-select" aria-hidden="true" />
            <span className={`saved-course-avatar ${tones[index % tones.length]}`}>{getInitials(course.title)}</span>
            <div className="saved-course-main">
                <div className="saved-course-title-row">
                    <a className="saved-course-title" href={course.course_link} target="_blank" rel="noreferrer">{course.title}</a>
                    {completed && <span className="course-complete-badge"><span aria-hidden="true">✓</span>Completed</span>}
                </div>
                <p className="saved-course-meta">{getDomain(course.course_link)}</p>
                <div className="saved-course-labels">
                    {(Array.isArray(course.labels) ? course.labels : []).map((label) => <span key={label}>{label}</span>)}
                </div>
                <div className="saved-course-progress" aria-label={`${progress}% complete`}>
                    <span style={{ width: `${progress}%` }} />
                </div>
            </div>
            <div className="saved-course-data">
                <label className="course-edit-field">
                    <input
                        type="number"
                        min="1"
                        step="1"
                        aria-label={`${course.title} planned hours`}
                        value={course.hours_to_complete ?? ''}
                        disabled={isEditing || isSaving || isDeleting}
                        onChange={(event) => onChange(course, 'hours_to_complete', event.target.value)}
                        onBlur={(event) => {
                            const normalizedHours = normalizeHours(event.target.value);
                            if (normalizedHours !== Number(course.hours_to_complete)) onChange(course, 'hours_to_complete', normalizedHours);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                event.currentTarget.blur();
                            }
                        }}
                    />
                    <small>h</small>
                </label>
                <label className="course-edit-field">
                    <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        aria-label={`${course.title} progress percentage`}
                        value={course.progress ?? progress}
                        disabled={isEditing || isSaving || isDeleting}
                        onChange={(event) => onChange(course, 'progress', event.target.value)}
                    />
                    <small>%</small>
                </label>
                <a href={course.course_link} target="_blank" rel="noreferrer">Open link <span aria-hidden="true">→</span></a>
                <div className="saved-course-actions">
                    <button type="button" onClick={() => onEdit(course)} aria-expanded={isEditing} disabled={isSaving || isDeleting}>{isEditing ? 'Close' : 'Edit'}</button>
                    <button type="button" className="delete-course-button" onClick={() => onDelete(course)} disabled={isSaving || isDeleting}>{isDeleting ? 'Deleting…' : 'Delete'}</button>
                </div>
                {saveStatus && <span className={`course-save-status ${saveStatus.type}`} role={saveStatus.type === 'error' ? 'alert' : 'status'}>{saveStatus.message}</span>}
            </div>
            {isEditing && <CourseEditForm
                course={course}
                form={editForm}
                isSaving={isSaving}
                onChange={onEditChange}
                onSubmit={onEditSubmit}
                onCancel={onCancelEdit}
            />}
        </article>
    );
}

export default function LearningList() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.user);
    const { courses, status, error } = useSelector((state) => state.courses);
    const [form, setForm] = useState(initialForm);
    const [formStatus, setFormStatus] = useState({ type: '', message: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [filter, setFilter] = useState('all');
    const [saveStatuses, setSaveStatuses] = useState({});
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [savingCourseId, setSavingCourseId] = useState(null);
    const [deletingCourseId, setDeletingCourseId] = useState(null);
    const [isSkillFocused, setIsSkillFocused] = useState(false);
    const [activeSkillSuggestion, setActiveSkillSuggestion] = useState(-1);
    const pendingCourses = useRef(new Map());
    const syncTimer = useRef(null);
    const inFlightSaves = useRef(new Map());

    useEffect(() => {
        if (!user) {
            dispatch(clearCourses());
            return undefined;
        }

        const request = dispatch(fetchCourses());
        return () => request.abort();
    }, [dispatch, user]);

    useEffect(() => () => {
        if (syncTimer.current !== null) window.clearTimeout(syncTimer.current);
        for (const course of pendingCourses.current.values()) {
            const activeSave = inFlightSaves.current.get(course.id);
            void Promise.resolve(activeSave)
                .catch(() => {})
                .then(() => persistCourse(course))
                .then((savedCourse) => dispatch(updateCourse(savedCourse)))
                .catch(() => {});
        }
        pendingCourses.current.clear();
    }, [dispatch]);

    const totalHours = courses.reduce((total, course) => total + (Number(course.hours_to_complete) || 0), 0);
    const completedHours = courses.reduce((total, course) => total + (Number(course.hours_to_complete) || 0) * getCourseProgress(course) / 100, 0);
    const completedCount = courses.filter((course) => getCourseProgress(course) >= 100).length;
    const visibleCourses = courses.filter((course) => {
        if (filter === 'active') return getCourseProgress(course) < 100;
        if (filter === 'done') return getCourseProgress(course) >= 100;
        return true;
    });
    const selectedSkills = form.labels.split(',').map((label) => label.trim().toLowerCase()).filter(Boolean);
    const skillQuery = form.labels.split(',').at(-1).trim();
    const matchingSkills = skillQuery
        ? skillCatalog
            .filter((skill) => skill.toLowerCase().includes(skillQuery.toLowerCase()) && !selectedSkills.includes(skill.toLowerCase()))
            .sort((first, second) => Number(!first.toLowerCase().startsWith(skillQuery.toLowerCase())) - Number(!second.toLowerCase().startsWith(skillQuery.toLowerCase())))
            .slice(0, 7)
        : [];
    const exactSkillExists = skillCatalog.some((skill) => skill.toLowerCase() === skillQuery.toLowerCase());
    const addCustomSkill = Boolean(skillQuery) && !exactSkillExists && !selectedSkills.includes(skillQuery.toLowerCase());
    const skillSuggestions = [
        ...matchingSkills.map((skill) => ({ skill, custom: false })),
        ...(addCustomSkill ? [{ skill: skillQuery, custom: true }] : []),
    ];
    const autocompleteOpen = isSkillFocused && Boolean(skillQuery);

    const flushPendingCourses = async () => {
        const batch = [...pendingCourses.current.entries()];
        pendingCourses.current.clear();

        await Promise.all(batch.map(async ([courseId, course]) => {
            const activeSave = inFlightSaves.current.get(courseId);
            if (activeSave) await activeSave.catch(() => {});
            if (pendingCourses.current.has(courseId)) return;

            const hours = Number(course.hours_to_complete);
            const progress = Number(course.progress);
            if (!Number.isInteger(hours) || hours < 1 || !Number.isInteger(progress) || progress < 0 || progress > 100) {
                setSaveStatuses((current) => ({ ...current, [courseId]: { type: 'error', message: 'Enter valid hours and progress.' } }));
                return;
            }

            setSaveStatuses((current) => ({ ...current, [courseId]: { type: 'saving', message: 'Saving…' } }));
            const saveRequest = persistCourse(course);
            inFlightSaves.current.set(courseId, saveRequest);
            try {
                const savedCourse = await saveRequest;
                if (!pendingCourses.current.has(courseId)) {
                    dispatch(updateCourse(savedCourse));
                    setSaveStatuses((current) => ({ ...current, [courseId]: { type: 'saved', message: 'Saved' } }));
                }
            } catch (saveError) {
                if (!pendingCourses.current.has(courseId)) {
                    setSaveStatuses((current) => ({ ...current, [courseId]: { type: 'error', message: saveError.message } }));
                }
            } finally {
                if (inFlightSaves.current.get(courseId) === saveRequest) inFlightSaves.current.delete(courseId);
            }
        }));
    };

    const saveCoursesWhenIdle = (course) => {
        pendingCourses.current.set(course.id, course);
        if (syncTimer.current !== null) window.clearTimeout(syncTimer.current);
        syncTimer.current = window.setTimeout(() => {
            syncTimer.current = null;
            void flushPendingCourses();
        }, SAVE_DELAY_MS);
        setSaveStatuses((current) => ({ ...current, [course.id]: { type: 'pending', message: 'Changes pending' } }));
    };

    const handleCourseChange = (course, field, rawValue) => {
        const value = rawValue === '' ? '' : Number(rawValue);
        const updatedCourse = { ...course, [field]: value };
        dispatch(updateCourse(updatedCourse));
        saveCoursesWhenIdle(updatedCourse);
    };

    const handleOpenEdit = (course) => {
        if (editingCourseId === course.id) {
            setEditingCourseId(null);
            setEditForm(null);
            return;
        }

        setEditingCourseId(course.id);
        setEditForm({
            title: course.title || '',
            description: course.description || '',
            link: course.course_link || '',
            hours: String(course.hours_to_complete ?? 1),
            progress: String(getCourseProgress(course)),
            labels: (Array.isArray(course.labels) ? course.labels : []).join(', '),
        });
    };

    const handleSaveEdit = async (event, course) => {
        event.preventDefault();
        const hours = normalizeHours(editForm.hours);
        const progress = Number(editForm.progress);
        const title = editForm.title.trim();
        const link = editForm.link.trim();
        let parsedLink;

        try {
            parsedLink = new URL(link);
        } catch {
            setSaveStatuses((current) => ({ ...current, [course.id]: { type: 'error', message: 'Enter a valid course link.' } }));
            return;
        }

        if (!title || title.length > 100 || link.length > 255 || !['http:', 'https:'].includes(parsedLink.protocol) || !Number.isInteger(hours) || hours < 1 || !Number.isInteger(progress) || progress < 0 || progress > 100) {
            setSaveStatuses((current) => ({ ...current, [course.id]: { type: 'error', message: 'Check the title, link, positive hours, and progress from 0 to 100.' } }));
            return;
        }

        const updatedCourse = {
            ...course,
            title,
            description: editForm.description.trim(),
            course_link: link,
            hours_to_complete: hours,
            progress,
            labels: editForm.labels.split(',').map((label) => label.trim()).filter(Boolean),
        };

        setSavingCourseId(course.id);
        try {
            if (syncTimer.current !== null) {
                window.clearTimeout(syncTimer.current);
                syncTimer.current = null;
            }
            await flushPendingCourses();
            const activeSave = inFlightSaves.current.get(course.id);
            if (activeSave) await activeSave.catch(() => {});

            const savedCourse = await persistCourse(updatedCourse);
            dispatch(updateCourse(savedCourse));
            setSaveStatuses((current) => ({ ...current, [course.id]: { type: 'saved', message: 'Saved' } }));
            setEditingCourseId(null);
            setEditForm(null);
        } catch (saveError) {
            setSaveStatuses((current) => ({ ...current, [course.id]: { type: 'error', message: saveError.message || 'Could not update this course.' } }));
        } finally {
            setSavingCourseId(null);
        }
    };

    const handleDeleteCourse = async (course) => {
        if (!window.confirm(`Delete “${course.title}” from your learning list?`)) return;

        const token = localStorage.getItem('token');
        if (!token) {
            setSaveStatuses((current) => ({ ...current, [course.id]: { type: 'error', message: 'Sign in to delete this course.' } }));
            return;
        }

        setDeletingCourseId(course.id);
        try {
            if (syncTimer.current !== null) {
                window.clearTimeout(syncTimer.current);
                syncTimer.current = null;
            }
            await flushPendingCourses();
            const activeSave = inFlightSaves.current.get(course.id);
            if (activeSave) await activeSave.catch(() => {});

            const response = await fetch(`${import.meta.env.VITE_SERVER}/courses/${course.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
                credentials: 'include',
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(getResponseError(data));
            }

            dispatch(removeCourse(course.id));
            setSaveStatuses((current) => {
                const nextStatuses = { ...current };
                delete nextStatuses[course.id];
                return nextStatuses;
            });
            if (editingCourseId === course.id) {
                setEditingCourseId(null);
                setEditForm(null);
            }
        } catch (deleteError) {
            setSaveStatuses((current) => ({ ...current, [course.id]: { type: 'error', message: deleteError.message || 'Could not delete this course.' } }));
        } finally {
            setDeletingCourseId(null);
        }
    };

    const handleEditFormChange = (field, value) => {
        setEditForm((current) => ({ ...current, [field]: value }));
    };

    const handleFormHoursBlur = (event) => {
        const hours = normalizeHours(event.currentTarget.value);
        setForm((current) => ({ ...current, hours: String(hours) }));
    };

    const toggleSkill = (skill) => {
        const labels = form.labels.split(',').map((label) => label.trim()).filter(Boolean);
        const isSelected = labels.some((label) => label.toLowerCase() === skill.toLowerCase());
        const updatedLabels = isSelected
            ? labels.filter((label) => label.toLowerCase() !== skill.toLowerCase())
            : [...labels, skill];
        setForm((current) => ({ ...current, labels: updatedLabels.join(', ') }));
    };

    const selectSkillSuggestion = (skill) => {
        const labels = form.labels.split(',').map((label) => label.trim()).filter(Boolean);
        labels.pop();
        if (!labels.some((label) => label.toLowerCase() === skill.toLowerCase())) labels.push(skill);
        setForm((current) => ({ ...current, labels: `${labels.join(', ')}, ` }));
        setActiveSkillSuggestion(-1);
    };

    const handleSkillKeyDown = (event) => {
        if (event.key === 'ArrowDown' && skillSuggestions.length) {
            event.preventDefault();
            setActiveSkillSuggestion((current) => (current + 1) % skillSuggestions.length);
        } else if (event.key === 'ArrowUp' && skillSuggestions.length) {
            event.preventDefault();
            setActiveSkillSuggestion((current) => current <= 0 ? skillSuggestions.length - 1 : current - 1);
        } else if (event.key === 'Escape') {
            setIsSkillFocused(false);
            setActiveSkillSuggestion(-1);
        } else if (event.key === 'Enter' && skillQuery) {
            event.preventDefault();
            const suggestion = skillSuggestions[activeSkillSuggestion] || skillSuggestions[0];
            selectSkillSuggestion(suggestion?.skill || skillQuery);
        }
    };

    const handleAddCourse = async (event) => {
        event.preventDefault();
        setFormStatus({ type: '', message: '' });

        if (!user) {
            setFormStatus({ type: 'error', message: 'Sign in before adding a course.' });
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setFormStatus({ type: 'error', message: 'Your session has expired. Sign in again.' });
            return;
        }

        const payload = {
            title: form.title.trim(),
            description: '',
            hours_to_complete: Number(form.hours),
            course_link: form.link.trim(),
            labels: form.labels.split(',').map((label) => label.trim()).filter(Boolean),
            progress: Number(form.progress),
        };

        if (!payload.title || !payload.course_link || !Number.isInteger(payload.hours_to_complete) || payload.hours_to_complete < 1 || !Number.isInteger(payload.progress) || payload.progress < 0 || payload.progress > 100) {
            setFormStatus({ type: 'error', message: 'Add a title, valid link, at least 1 planned hour, and progress from 0 to 100.' });
            return;
        }

        setIsAdding(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER}/courses`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(getResponseError(data));

            dispatch(addCourse(data.course));
            setForm(initialForm);
            setFormStatus({ type: 'success', message: 'Course added to your list.' });
        } catch (addError) {
            setFormStatus({ type: 'error', message: addError.message || 'Could not add this course.' });
        } finally {
            setIsAdding(false);
        }
    };

    const filterOptions = [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'done', label: 'Done' },
    ];

    return (
        <div className="learning-page">
            <header className="learning-page-heading">
                <p className="eyebrow">YOUR QUEUE</p>
                <h1>Learning list</h1>
                <p>Save anything you want to learn and check it off when you’re done.</p>
            </header>

            <form className="learning-entry" onSubmit={handleAddCourse}>
                <label className="visually-hidden" htmlFor="course-title">Course title</label>
                <input id="course-title" type="text" maxLength="100" placeholder="What do you want to learn?" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
                <label className="visually-hidden" htmlFor="course-link">Course link</label>
                <input id="course-link" type="url" maxLength="255" placeholder="Paste a link from anywhere" value={form.link} onChange={(event) => setForm({ ...form, link: event.target.value })} required />
                <label className="entry-number">
                    <input
                        type="number"
                        min="1"
                        step="1"
                        aria-label="Planned hours"
                        value={form.hours}
                        onChange={(event) => setForm({ ...form, hours: event.target.value })}
                        onBlur={handleFormHoursBlur}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                event.currentTarget.blur();
                            }
                        }}
                        required
                    />
                    <span>hours</span>
                </label>
                <label className="entry-number entry-percent">
                    <input type="number" min="0" max="100" step="1" aria-label="Progress percentage" value={form.progress} onChange={(event) => setForm({ ...form, progress: event.target.value })} required />
                    <span>%</span>
                </label>
                <div className="skill-input-wrap">
                    <label className="visually-hidden" htmlFor="course-labels">Skills and topics</label>
                    <input
                        id="course-labels"
                        className="entry-labels"
                        type="text"
                        placeholder="Skills, comma separated (JavaScript, OpenShift)"
                        value={form.labels}
                        onChange={(event) => {
                            setForm({ ...form, labels: event.target.value });
                            setActiveSkillSuggestion(-1);
                        }}
                        onFocus={() => setIsSkillFocused(true)}
                        onBlur={() => setIsSkillFocused(false)}
                        onKeyDown={handleSkillKeyDown}
                        autoComplete="off"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={autocompleteOpen && skillSuggestions.length > 0}
                        aria-controls="skill-suggestions"
                        aria-activedescendant={activeSkillSuggestion >= 0 ? `skill-suggestion-${activeSkillSuggestion}` : undefined}
                    />
                    {autocompleteOpen && <ul id="skill-suggestions" className="skill-suggestions" role="listbox">
                        {skillSuggestions.map(({ skill, custom }, index) => (
                            <li id={`skill-suggestion-${index}`} key={skill} role="option" aria-selected={activeSkillSuggestion === index}>
                                <button
                                    type="button"
                                    className={activeSkillSuggestion === index ? 'skill-suggestion-active' : ''}
                                    onPointerDown={(event) => event.preventDefault()}
                                    onClick={() => selectSkillSuggestion(skill)}
                                >
                                    <span>{custom ? `Add custom skill: ${skill}` : skill}</span>
                                    {custom && <small>Custom</small>}
                                </button>
                            </li>
                        ))}
                        {!skillSuggestions.length && <li className="skill-suggestion-empty">Already selected</li>}
                    </ul>}
                </div>
                <button type="submit" className="entry-submit" disabled={isAdding}>{isAdding ? 'Adding…' : 'Add to list'}</button>
                <fieldset className="skill-picker">
                    <legend>Popular skills</legend>
                    <div className="skill-options">
                        {popularSkills.map((skill) => {
                            const isSelected = selectedSkills.includes(skill.toLowerCase());
                            return <button key={skill} type="button" className={isSelected ? 'skill-option selected' : 'skill-option'} aria-pressed={isSelected} onClick={() => toggleSkill(skill)}>{skill}</button>;
                        })}
                    </div>
                </fieldset>
                <p className="entry-hint">Choose suggestions or enter your own comma-separated skills. Hours and progress can be updated later.</p>
                {formStatus.message && <p className={`form-status ${formStatus.type}`} role={formStatus.type === 'error' ? 'alert' : 'status'}>{formStatus.message}</p>}
            </form>

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
                        {filterOptions.map((option) => <button key={option.id} type="button" className={filter === option.id ? 'filter-active' : ''} aria-pressed={filter === option.id} onClick={() => setFilter(option.id)}>{option.label}</button>)}
                    </div>
                </div>

                <div className="saved-course-list">
                    {!user && <p className="course-list-message">Sign in to see and manage your learning list.</p>}
                    {user && status === 'loading' && courses.length === 0 && <p className="course-list-message">Loading your courses...</p>}
                    {user && status === 'failed' && <p className="course-list-message course-list-error" role="alert">{error || 'Could not load your courses.'}</p>}
                    {user && status === 'succeeded' && courses.length === 0 && <p className="course-list-message">No saved courses yet. Add your first one above.</p>}
                    {visibleCourses.map((course, index) => (
                        <LearningItem
                            key={course.id}
                            course={course}
                            index={index}
                            saveStatus={saveStatuses[course.id]}
                            editForm={editingCourseId === course.id ? editForm : null}
                            isEditing={editingCourseId === course.id}
                            isSaving={savingCourseId === course.id}
                            isDeleting={deletingCourseId === course.id}
                            onChange={handleCourseChange}
                            onEdit={handleOpenEdit}
                            onDelete={handleDeleteCourse}
                            onEditChange={handleEditFormChange}
                            onEditSubmit={handleSaveEdit}
                            onCancelEdit={() => {
                                setEditingCourseId(null);
                                setEditForm(null);
                            }}
                        />
                    ))}
                    {user && status === 'succeeded' && courses.length > 0 && visibleCourses.length === 0 && <p className="course-list-message">No courses in this filter.</p>}
                </div>
            </section>
        </div>
    );
}
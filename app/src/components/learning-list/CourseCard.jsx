import { useState } from 'react';
import CourseEditForm from './CourseEditForm';
import { getCourseDomain, getCourseInitials, getCourseProgress, normalizeHours, parseCourseLabels } from '../../utils/courseUtils';

const tones = ['coral', 'blue', 'lilac', 'mint'];

export default function CourseCard({ course, index, saveStatus, onFieldChange, onSave, onDelete }) {
    const [editForm, setEditForm] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [actionError, setActionError] = useState('');
    const progress = getCourseProgress(course);
    const completed = progress >= 100;
    const isEditing = editForm !== null;

    const openEditor = () => {
        if (isEditing) {
            setEditForm(null);
            return;
        }
        setActionError('');
        setEditForm({
            title: course.title || '',
            description: course.description || '',
            link: course.course_link || '',
            hours: String(course.hours_to_complete ?? 1),
            progress: String(progress),
            labels: (Array.isArray(course.labels) ? course.labels : []).join(', '),
        });
    };

    const handleSave = async (event) => {
        event.preventDefault();
        const hours = normalizeHours(editForm.hours);
        const updatedProgress = Number(editForm.progress);
        const title = editForm.title.trim();
        const link = editForm.link.trim();
        let parsedLink;

        try {
            parsedLink = new URL(link);
        } catch {
            setActionError('Enter a valid course link.');
            return;
        }

        if (!title || title.length > 100 || link.length > 255 || !['http:', 'https:'].includes(parsedLink.protocol) || !Number.isInteger(updatedProgress) || updatedProgress < 0 || updatedProgress > 100) {
            setActionError('Check the title, link, positive hours, and progress from 0 to 100.');
            return;
        }

        setIsSaving(true);
        setActionError('');
        try {
            await onSave({
                ...course,
                title,
                description: editForm.description.trim(),
                course_link: link,
                hours_to_complete: hours,
                progress: updatedProgress,
                labels: parseCourseLabels(editForm.labels),
            });
            setEditForm(null);
        } catch (error) {
            setActionError(error.message || 'Could not update this course.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete “${course.title}” from your learning list?`)) return;
        setIsDeleting(true);
        setActionError('');
        try {
            await onDelete(course.id);
        } catch (error) {
            setActionError(error.message || 'Could not delete this course.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleFieldChange = (field, value) => {
        setActionError('');
        onFieldChange(course, field, value);
    };

    return (
        <article className={`saved-course${completed ? ' completed-course' : ''}`}>
            <span className="saved-course-select" aria-hidden="true" />
            <span className={`saved-course-avatar ${tones[index % tones.length]}`}>{getCourseInitials(course.title)}</span>
            <div className="saved-course-main">
                <div className="saved-course-title-row">
                    <a className="saved-course-title" href={course.course_link} target="_blank" rel="noreferrer">{course.title}</a>
                    {completed && <span className="course-complete-badge"><span aria-hidden="true">✓</span>Completed</span>}
                </div>
                <p className="saved-course-meta">{getCourseDomain(course.course_link)}</p>
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
                        onChange={(event) => handleFieldChange('hours_to_complete', event.target.value)}
                        onBlur={(event) => {
                            const normalizedHours = normalizeHours(event.target.value);
                            if (normalizedHours !== Number(course.hours_to_complete)) handleFieldChange('hours_to_complete', normalizedHours);
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
                        onChange={(event) => handleFieldChange('progress', event.target.value)}
                    />
                    <small>%</small>
                </label>
                <a href={course.course_link} target="_blank" rel="noreferrer">Open link <span aria-hidden="true">→</span></a>
                <div className="saved-course-actions">
                    <button type="button" onClick={openEditor} aria-expanded={isEditing} disabled={isSaving || isDeleting}>{isEditing ? 'Close' : 'Edit'}</button>
                    <button type="button" className="delete-course-button" onClick={handleDelete} disabled={isSaving || isDeleting}>{isDeleting ? 'Deleting…' : 'Delete'}</button>
                </div>
                {saveStatus && <span className={`course-save-status ${saveStatus.type}`} role={saveStatus.type === 'error' ? 'alert' : 'status'}>{saveStatus.message}</span>}
                {actionError && <span className="course-save-status error" role="alert">{actionError}</span>}
            </div>
            {isEditing && <CourseEditForm
                form={editForm}
                isSaving={isSaving}
                onChange={(field, value) => setEditForm((current) => ({ ...current, [field]: value }))}
                onSubmit={handleSave}
                onCancel={() => setEditForm(null)}
            />}
        </article>
    );
}
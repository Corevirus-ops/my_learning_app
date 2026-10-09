import { useState } from 'react';
import { normalizeHours, parseCourseLabels } from '../../utils/courseUtils';
import SkillPicker from './SkillPicker';

const initialForm = { title: '', description: '', link: '', hours: '1', progress: '0', labels: '' };

export default function CourseEntryForm({ user, onCreate }) {
    const [form, setForm] = useState(initialForm);
    const [formStatus, setFormStatus] = useState({ type: '', message: '' });
    const [isAdding, setIsAdding] = useState(false);
    const handleHoursBlur = (event) => {
        const hours = normalizeHours(event.currentTarget.value);
        setForm((current) => ({ ...current, hours: String(hours) }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormStatus({ type: '', message: '' });

        if (!user) {
            setFormStatus({ type: 'error', message: 'Sign in before adding a course.' });
            return;
        }

        const course = {
            title: form.title.trim(),
            description: form.description.trim(),
            hours_to_complete: Number(form.hours),
            course_link: form.link.trim(),
            labels: parseCourseLabels(form.labels),
            progress: Number(form.progress),
        };

        if (!course.title || !course.course_link || !Number.isInteger(course.hours_to_complete) || course.hours_to_complete < 1 || !Number.isInteger(course.progress) || course.progress < 0 || course.progress > 100) {
            setFormStatus({ type: 'error', message: 'Add a title, valid link, at least 1 planned hour, and progress from 0 to 100.' });
            return;
        }

        setIsAdding(true);
        try {
            await onCreate(course);
            setForm(initialForm);
            setFormStatus({ type: 'success', message: 'Course added to your list.' });
        } catch (error) {
            setFormStatus({ type: 'error', message: error.message || 'Could not add this course.' });
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <form className="learning-entry" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="course-title">Course title</label>
            <input id="course-title" type="text" maxLength="100" placeholder="What do you want to learn?" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            <label className="visually-hidden" htmlFor="course-link">Course link</label>
            <input id="course-link" type="url" maxLength="255" placeholder="Paste a link from anywhere" value={form.link} onChange={(event) => setForm({ ...form, link: event.target.value })} required />
            <label className="course-entry-description">
                <span>Description</span>
                <textarea rows="2" maxLength="1000" placeholder="What would you like to learn or build?" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </label>
            <label className="entry-number">
                <input
                    type="number"
                    min="1"
                    step="1"
                    aria-label="Planned hours"
                    value={form.hours}
                    onChange={(event) => setForm({ ...form, hours: event.target.value })}
                    onBlur={handleHoursBlur}
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
            <SkillPicker id="course-labels" value={form.labels} onChange={(labels) => setForm((current) => ({ ...current, labels }))} />
            <button type="submit" className="entry-submit" disabled={isAdding}>{isAdding ? 'Adding…' : 'Add to list'}</button>
            <p className="entry-hint">Choose suggestions or enter your own comma-separated skills. Hours and progress can be updated later.</p>
            {formStatus.message && <p className={`form-status ${formStatus.type}`} role={formStatus.type === 'error' ? 'alert' : 'status'}>{formStatus.message}</p>}
        </form>
    );
}
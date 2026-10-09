import SkillPicker from './SkillPicker';

export default function CourseEditForm({ courseId, form, isSaving, onChange, onSubmit, onCancel }) {
    return (
        <form className="course-edit-panel" onSubmit={onSubmit}>
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
                <textarea rows="3" maxLength="1000" value={form.description} onChange={(event) => onChange('description', event.target.value)} disabled={isSaving} placeholder="Add a note about what you want to learn." />
            </label>
            <label>
                <span>Planned hours</span>
                <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.hours}
                    onChange={(event) => onChange('hours', event.target.value)}
                    onBlur={(event) => onChange('hours', String(Math.max(1, Math.ceil(Number(event.target.value) || 1))))}
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
            <div className="course-edit-labels">
                <SkillPicker id={`edit-course-${courseId}-skills`} value={form.labels} onChange={(labels) => onChange('labels', labels)} />
            </div>
            <div className="course-edit-actions">
                <button type="button" className="course-cancel-button" onClick={onCancel} disabled={isSaving}>Cancel</button>
                <button type="submit" className="course-save-button" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save changes'}</button>
            </div>
        </form>
    );
}
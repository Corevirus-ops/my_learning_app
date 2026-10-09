import { useState } from 'react';
import { skillCatalog } from '../../data/skillCatalog';
import { normalizeHours, parseCourseLabels } from '../../utils/courseUtils';

const popularSkills = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git & GitHub', 'REST APIs', 'Testing'];
const initialForm = { title: '', link: '', hours: '1', progress: '0', labels: '' };

export default function CourseEntryForm({ user, onCreate }) {
    const [form, setForm] = useState(initialForm);
    const [formStatus, setFormStatus] = useState({ type: '', message: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [isSkillFocused, setIsSkillFocused] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);

    const selectedSkills = parseCourseLabels(form.labels).map((label) => label.toLowerCase());
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

    const handleHoursBlur = (event) => {
        const hours = normalizeHours(event.currentTarget.value);
        setForm((current) => ({ ...current, hours: String(hours) }));
    };

    const toggleSkill = (skill) => {
        const labels = parseCourseLabels(form.labels);
        const isSelected = labels.some((label) => label.toLowerCase() === skill.toLowerCase());
        const updatedLabels = isSelected
            ? labels.filter((label) => label.toLowerCase() !== skill.toLowerCase())
            : [...labels, skill];
        setForm((current) => ({ ...current, labels: updatedLabels.join(', ') }));
    };

    const selectSkill = (skill) => {
        const labels = parseCourseLabels(form.labels);
        labels.pop();
        if (!labels.some((label) => label.toLowerCase() === skill.toLowerCase())) labels.push(skill);
        setForm((current) => ({ ...current, labels: `${labels.join(', ')}, ` }));
        setActiveSuggestion(-1);
    };

    const handleSkillKeyDown = (event) => {
        if (event.key === 'ArrowDown' && skillSuggestions.length) {
            event.preventDefault();
            setActiveSuggestion((current) => (current + 1) % skillSuggestions.length);
        } else if (event.key === 'ArrowUp' && skillSuggestions.length) {
            event.preventDefault();
            setActiveSuggestion((current) => current <= 0 ? skillSuggestions.length - 1 : current - 1);
        } else if (event.key === 'Escape') {
            setIsSkillFocused(false);
            setActiveSuggestion(-1);
        } else if (event.key === 'Enter' && skillQuery) {
            event.preventDefault();
            const suggestion = skillSuggestions[activeSuggestion] || skillSuggestions[0];
            selectSkill(suggestion?.skill || skillQuery);
        }
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
            description: '',
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
                        setActiveSuggestion(-1);
                    }}
                    onFocus={() => setIsSkillFocused(true)}
                    onBlur={() => setIsSkillFocused(false)}
                    onKeyDown={handleSkillKeyDown}
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={autocompleteOpen && skillSuggestions.length > 0}
                    aria-controls="skill-suggestions"
                    aria-activedescendant={activeSuggestion >= 0 ? `skill-suggestion-${activeSuggestion}` : undefined}
                />
                {autocompleteOpen && <ul id="skill-suggestions" className="skill-suggestions" role="listbox">
                    {skillSuggestions.map(({ skill, custom }, index) => (
                        <li id={`skill-suggestion-${index}`} key={skill} role="option" aria-selected={activeSuggestion === index}>
                            <button
                                type="button"
                                className={activeSuggestion === index ? 'skill-suggestion-active' : ''}
                                onPointerDown={(event) => event.preventDefault()}
                                onClick={() => selectSkill(skill)}
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
    );
}
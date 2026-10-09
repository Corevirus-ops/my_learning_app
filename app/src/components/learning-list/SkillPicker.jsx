import { useState } from 'react';
import { skillCatalog } from '../../data/skillCatalog';
import { parseCourseLabels } from '../../utils/courseUtils';

const popularSkills = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git & GitHub', 'REST APIs', 'Testing'];

export default function SkillPicker({ id, value, onChange, placeholder = 'Start typing a skill', showPopular = true }) {
    const [isFocused, setIsFocused] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const selectedSkills = parseCourseLabels(value).map((skill) => skill.toLowerCase());
    const query = value.split(',').at(-1).trim();
    const matchingSkills = query
        ? skillCatalog
            .filter((skill) => skill.toLowerCase().includes(query.toLowerCase()) && !selectedSkills.includes(skill.toLowerCase()))
            .sort((first, second) => Number(!first.toLowerCase().startsWith(query.toLowerCase())) - Number(!second.toLowerCase().startsWith(query.toLowerCase())))
            .slice(0, 7)
        : [];
    const exactSkillExists = skillCatalog.some((skill) => skill.toLowerCase() === query.toLowerCase());
    const addCustomSkill = Boolean(query) && !exactSkillExists && !selectedSkills.includes(query.toLowerCase());
    const suggestions = [
        ...matchingSkills.map((skill) => ({ skill, custom: false })),
        ...(addCustomSkill ? [{ skill: query, custom: true }] : []),
    ];
    const showSuggestions = isFocused && Boolean(query);
    const suggestionsId = `${id}-suggestions`;

    const chooseSkill = (skill) => {
        const labels = parseCourseLabels(value);
        labels.pop();
        if (!labels.some((label) => label.toLowerCase() === skill.toLowerCase())) labels.push(skill);
        onChange(`${labels.join(', ')}, `);
        setActiveSuggestion(-1);
    };

    const togglePopularSkill = (skill) => {
        const labels = parseCourseLabels(value);
        const isSelected = labels.some((label) => label.toLowerCase() === skill.toLowerCase());
        onChange((isSelected
            ? labels.filter((label) => label.toLowerCase() !== skill.toLowerCase())
            : [...labels, skill]
        ).join(', '));
    };

    const handleKeyDown = (event) => {
        if (event.key === 'ArrowDown' && suggestions.length) {
            event.preventDefault();
            setActiveSuggestion((current) => (current + 1) % suggestions.length);
        } else if (event.key === 'ArrowUp' && suggestions.length) {
            event.preventDefault();
            setActiveSuggestion((current) => current <= 0 ? suggestions.length - 1 : current - 1);
        } else if (event.key === 'Escape') {
            setIsFocused(false);
            setActiveSuggestion(-1);
        } else if (event.key === 'Enter' && query) {
            event.preventDefault();
            const suggestion = suggestions[activeSuggestion] || suggestions[0];
            chooseSkill(suggestion?.skill || query);
        }
    };

    return (
        <div className="skill-input-wrap">
            <label className="visually-hidden" htmlFor={id}>Skills and topics</label>
            <input
                id={id}
                className="entry-labels"
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(event) => {
                    onChange(event.target.value);
                    setActiveSuggestion(-1);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={showSuggestions && suggestions.length > 0}
                aria-controls={suggestionsId}
                aria-activedescendant={activeSuggestion >= 0 ? `${id}-suggestion-${activeSuggestion}` : undefined}
            />
            {showSuggestions && <ul id={suggestionsId} className="skill-suggestions" role="listbox">
                {suggestions.map(({ skill, custom }, index) => (
                    <li id={`${id}-suggestion-${index}`} key={skill} role="option" aria-selected={activeSuggestion === index}>
                        <button
                            type="button"
                            className={activeSuggestion === index ? 'skill-suggestion-active' : ''}
                            onPointerDown={(event) => event.preventDefault()}
                            onClick={() => chooseSkill(skill)}
                        >
                            <span>{custom ? `Add custom skill: ${skill}` : skill}</span>
                            {custom && <small>Custom</small>}
                        </button>
                    </li>
                ))}
                {!suggestions.length && <li className="skill-suggestion-empty">Already selected</li>}
            </ul>}
            {showPopular && <fieldset className="skill-picker">
                <legend>Popular skills</legend>
                <div className="skill-options">
                    {popularSkills.map((skill) => {
                        const isSelected = selectedSkills.includes(skill.toLowerCase());
                        return <button key={skill} type="button" className={isSelected ? 'skill-option selected' : 'skill-option'} aria-pressed={isSelected} onClick={() => togglePopularSkill(skill)}>{skill}</button>;
                    })}
                </div>
            </fieldset>}
        </div>
    );
}
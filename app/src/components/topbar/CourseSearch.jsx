import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function getSearchableText(course) {
    return [
        course.title,
        course.description,
        course.course_link,
        ...(Array.isArray(course.labels) ? course.labels : []),
    ].filter(Boolean).join(' ').toLocaleLowerCase();
}

function getResultDetail(course) {
    const labels = Array.isArray(course.labels) ? course.labels.slice(0, 2).join(', ') : '';
    return labels || course.description || course.course_link || 'Saved course';
}

export default function CourseSearch() {
    const courses = useSelector((state) => state.courses.courses);
    const courseStatus = useSelector((state) => state.courses.status);
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef(null);
    const resultRefs = useRef([]);
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const results = normalizedQuery
        ? courses.filter((course) => getSearchableText(course).includes(normalizedQuery)).slice(0, 6)
        : [];
    const dropdownOpen = isFocused && Boolean(normalizedQuery);

    useEffect(() => {
        const handleShortcut = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleShortcut);
        return () => window.removeEventListener('keydown', handleShortcut);
    }, []);

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            setIsFocused(false);
            inputRef.current?.blur();
        } else if (event.key === 'ArrowDown' && results.length) {
            event.preventDefault();
            setActiveIndex((current) => (current + 1) % results.length);
        } else if (event.key === 'ArrowUp' && results.length) {
            event.preventDefault();
            setActiveIndex((current) => current <= 0 ? results.length - 1 : current - 1);
        } else if (event.key === 'Enter' && results.length) {
            event.preventDefault();
            resultRefs.current[activeIndex]?.click();
        }
    };

    const handleResultClick = (event, course) => {
        if (course.course_link) return;
        event.preventDefault();
        navigate('/learning-list');
        setIsFocused(false);
    };

    return (
        <div className="course-search-wrap">
            <label className="search-box" htmlFor="global-course-search">
                <span aria-hidden="true">⌕</span>
                <input
                    ref={inputRef}
                    id="global-course-search"
                    type="search"
                    aria-label="Search courses, notes, and skills"
                    aria-autocomplete="list"
                    aria-expanded={dropdownOpen}
                    aria-controls="global-course-search-results"
                    aria-activedescendant={results.length ? `course-search-option-${activeIndex}` : undefined}
                    placeholder="Search links, notes, skills..."
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setActiveIndex(0);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                />
                <kbd>⌘ K</kbd>
            </label>
            {dropdownOpen && <div className="course-search-dropdown" id="global-course-search-results" role="listbox">
                {results.length ? results.map((course, index) => (
                    <a
                        className={`course-search-result${activeIndex === index ? ' active' : ''}`}
                        id={`course-search-option-${index}`}
                        href={course.course_link || '/learning-list'}
                        target={course.course_link ? '_blank' : undefined}
                        rel={course.course_link ? 'noreferrer' : undefined}
                        role="option"
                        aria-selected={activeIndex === index}
                        key={course.id}
                        ref={(element) => { resultRefs.current[index] = element; }}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={(event) => {
                            handleResultClick(event, course);
                            setIsFocused(false);
                        }}
                    >
                        <span className="course-search-result-icon" aria-hidden="true">{course.progress >= 100 ? '✓' : '↗'}</span>
                        <span className="course-search-result-copy"><strong>{course.title}</strong><small>{getResultDetail(course)}</small></span>
                        <small className="course-search-result-progress">{course.progress ?? 0}%</small>
                    </a>
                )) : <p className="course-search-empty">{courseStatus === 'loading' ? 'Loading your courses...' : 'No matching courses found.'}</p>}
                {results.length === 6 && <p className="course-search-hint">Showing the first 6 matches</p>}
            </div>}
        </div>
    );
}
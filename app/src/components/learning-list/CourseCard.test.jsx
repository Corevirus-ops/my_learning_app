import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CourseCard from './CourseCard';

const course = {
    id: 17,
    title: 'Build an API',
    description: 'Practice backend development.',
    course_link: 'https://example.com/api',
    hours_to_complete: 8,
    progress: 25,
    labels: ['Node.js'],
};

function renderCard(overrides = {}) {
    const props = {
        course,
        index: 0,
        saveStatus: null,
        onFieldChange: vi.fn(),
        onSave: vi.fn().mockResolvedValue({ ...course }),
        onDelete: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    };
    return { ...render(<CourseCard {...props} />), props };
}

describe('CourseCard', () => {
    it('edits course details and selects skills with autocomplete', async () => {
        const user = userEvent.setup();
        const { props } = renderCard();
        await user.click(screen.getByRole('button', { name: 'Edit' }));

        await user.clear(screen.getByRole('textbox', { name: 'Title' }));
        await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Full-stack API');
        await user.clear(screen.getByRole('textbox', { name: 'Description' }));
        await user.type(screen.getByRole('textbox', { name: 'Description' }), 'Build and test a REST API.');
        await user.clear(screen.getByRole('textbox', { name: 'Link' }));
        await user.type(screen.getByRole('textbox', { name: 'Link' }), 'https://example.com/fullstack');
        await user.clear(screen.getByRole('spinbutton', { name: 'Planned hours' }));
        await user.type(screen.getByRole('spinbutton', { name: 'Planned hours' }), '12');
        await user.clear(screen.getByRole('spinbutton', { name: 'Progress (%)' }));
        await user.type(screen.getByRole('spinbutton', { name: 'Progress (%)' }), '60');

        const skillsInput = screen.getByRole('combobox', { name: 'Skills and topics' });
        await user.clear(skillsInput);
        await user.type(skillsInput, 'Vue');
        await user.click(await screen.findByRole('button', { name: 'Vue.js' }));
        await user.click(screen.getByRole('button', { name: 'Save changes' }));

        await waitFor(() => expect(props.onSave).toHaveBeenCalledWith({
            ...course,
            title: 'Full-stack API',
            description: 'Build and test a REST API.',
            course_link: 'https://example.com/fullstack',
            hours_to_complete: 12,
            progress: 60,
            labels: ['Vue.js'],
        }));
        expect(screen.getByRole('button', { name: 'Edit' })).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('textbox', { name: 'Title' })).not.toBeInTheDocument();
    });

    it('deletes the course only after confirmation', async () => {
        const user = userEvent.setup();
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
        const { props } = renderCard();

        await user.click(screen.getByRole('button', { name: 'Delete' }));
        expect(confirm).toHaveBeenCalledWith('Delete “Build an API” from your learning list?');
        expect(props.onDelete).not.toHaveBeenCalled();

        confirm.mockReturnValue(true);
        await user.click(screen.getByRole('button', { name: 'Delete' }));
        await waitFor(() => expect(props.onDelete).toHaveBeenCalledWith(course.id));
    });
});
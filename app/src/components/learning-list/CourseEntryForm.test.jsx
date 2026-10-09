import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CourseEntryForm from './CourseEntryForm';

describe('CourseEntryForm', () => {
    it('creates a course with its description and autocomplete skills, then resets', async () => {
        const user = userEvent.setup();
        const onCreate = vi.fn().mockResolvedValue({ id: 12 });
        render(<CourseEntryForm user={{ id: 4, username: 'Corevirus' }} onCreate={onCreate} />);

        await user.type(screen.getByPlaceholderText('What do you want to learn?'), 'React foundations');
        await user.type(screen.getByPlaceholderText('Paste a link from anywhere'), 'https://react.dev/learn');
        await user.type(screen.getByPlaceholderText('What would you like to learn or build?'), 'Build reusable user interfaces.');

        const skillsInput = screen.getByRole('combobox', { name: 'Skills and topics' });
        await user.type(skillsInput, 'Rea');
        await user.click(within(screen.getByRole('listbox')).getByRole('button', { name: 'React' }));
        await user.type(skillsInput, 'Testing');
        await user.click(within(screen.getByRole('listbox')).getByRole('button', { name: /Add custom skill: Testing/ }));
        await user.click(screen.getByRole('button', { name: 'Add to list' }));

        await waitFor(() => expect(onCreate).toHaveBeenCalledWith({
            title: 'React foundations',
            description: 'Build reusable user interfaces.',
            hours_to_complete: 1,
            course_link: 'https://react.dev/learn',
            labels: ['React', 'Testing'],
            progress: 0,
        }));
        expect(await screen.findByRole('status')).toHaveTextContent('Course added to your list.');
        expect(screen.getByPlaceholderText('What do you want to learn?')).toHaveValue('');
    });

    it('shows a rejected create request without clearing the form', async () => {
        const user = userEvent.setup();
        const onCreate = vi.fn().mockRejectedValue(new Error('Server is unavailable.'));
        render(<CourseEntryForm user={{ id: 4 }} onCreate={onCreate} />);

        await user.type(screen.getByPlaceholderText('What do you want to learn?'), 'Intro to SQL');
        await user.type(screen.getByPlaceholderText('Paste a link from anywhere'), 'https://example.com/sql');
        await user.click(screen.getByRole('button', { name: 'Add to list' }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Server is unavailable.');
        expect(screen.getByPlaceholderText('What do you want to learn?')).toHaveValue('Intro to SQL');
    });

    it('normalizes invalid hours when the field loses focus', async () => {
        const user = userEvent.setup();
        render(<CourseEntryForm user={{ id: 4 }} onCreate={vi.fn()} />);

        const hoursInput = screen.getByRole('spinbutton', { name: 'Planned hours' });
        await user.clear(hoursInput);
        await user.type(hoursInput, '-100');
        await user.tab();

        expect(hoursInput).toHaveValue(1);
    });
});
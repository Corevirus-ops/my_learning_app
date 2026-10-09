import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import courseReducer from '../courseSlice';
import CourseSearch from './CourseSearch';

function renderSearch(courses) {
    const store = configureStore({
        reducer: { courses: courseReducer },
        preloadedState: {
            courses: { courses, status: 'succeeded', error: null, currentRequestId: null },
        },
    });

    return render(
        <Provider store={store}>
            <MemoryRouter>
                <CourseSearch />
            </MemoryRouter>
        </Provider>
    );
}

describe('CourseSearch', () => {
    it('matches local courses by label and description', async () => {
        const user = userEvent.setup();
        renderSearch([
            {
                id: 1,
                title: 'API Design',
                description: 'Build and document service endpoints',
                course_link: 'https://example.com/api',
                labels: ['REST APIs', 'Node.js'],
                progress: 30,
            },
            {
                id: 2,
                title: 'Data Foundations',
                description: 'Query and inspect data models',
                course_link: 'https://example.com/data',
                labels: ['SQL'],
                progress: 0,
            },
        ]);

        const search = screen.getByRole('searchbox', { name: 'Search courses, notes, and skills' });
        await user.type(search, 'rest apis');
        expect(screen.getByRole('option', { name: /API Design/ })).toHaveAttribute('href', 'https://example.com/api');
        expect(screen.queryByRole('option', { name: /Data Foundations/ })).not.toBeInTheDocument();

        await user.clear(search);
        await user.type(search, 'inspect data models');
        expect(screen.getByRole('option', { name: /Data Foundations/ })).toBeInTheDocument();
    });

    it('shows an empty state and focuses from the Ctrl+K shortcut', async () => {
        const user = userEvent.setup();
        renderSearch([]);

        const search = screen.getByRole('searchbox', { name: 'Search courses, notes, and skills' });
        await user.type(search, 'unknown');
        expect(screen.getByText('No matching courses found.')).toBeInTheDocument();

        await user.tab();
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
        expect(search).toHaveFocus();
    });
});
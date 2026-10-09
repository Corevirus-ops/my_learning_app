import { configureStore } from '@reduxjs/toolkit';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLearningSettings, saveLearningSettings } from '../services/learningService';
import Settings from './Settings';

vi.mock('../services/learningService', () => ({
    getLearningSettings: vi.fn(),
    saveLearningSettings: vi.fn(),
}));

function renderSettings() {
    const store = configureStore({
        reducer: {
            user: (state = { user: { id: 9, username: 'Corevirus', email: 'core@example.com' } }) => state,
        },
    });
    return render(<Provider store={store}><Settings /></Provider>);
}

describe('Settings', () => {
    beforeEach(() => {
        getLearningSettings.mockResolvedValue({ weekly_active_goal: 5, timezone: 'UTC' });
        saveLearningSettings.mockResolvedValue({ weekly_active_goal: 3, timezone: 'Europe/London' });
    });

    it('loads and saves the weekly activity goal and timezone', async () => {
        const user = userEvent.setup();
        renderSettings();

        const goal = await screen.findByLabelText('Active days each week');
        const timezone = screen.getByLabelText('Your time zone');
        await user.selectOptions(goal, '3');
        await user.selectOptions(timezone, 'Europe/London');
        await user.click(screen.getByRole('button', { name: 'Save preferences' }));

        await waitFor(() => expect(saveLearningSettings).toHaveBeenCalledWith({
            weekly_active_goal: 3,
            timezone: 'Europe/London',
        }));
        expect(await screen.findByRole('status')).toHaveTextContent('Preferences saved.');
    });
});
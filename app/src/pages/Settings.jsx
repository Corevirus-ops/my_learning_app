import { useEffect, useState } from 'react';
import { getLearningSettings, saveLearningSettings } from '../services/learningService';
import { useLearningResource } from '../hooks/useLearningResource';
import './Settings.css';

const initialSettings = { weekly_active_goal: 5, timezone: 'UTC' };
const commonTimezones = [
    'UTC',
    'America/Los_Angeles',
    'America/Denver',
    'America/Chicago',
    'America/New_York',
    'America/Toronto',
    'Europe/London',
    'Europe/Paris',
    'Asia/Kolkata',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Sydney',
];

function getTimezoneLabel(timezone) {
    return timezone.replaceAll('_', ' ').replaceAll('/', ' / ');
}

export default function Settings() {
    const { user, data, status, error } = useLearningResource(getLearningSettings, initialSettings);
    const [form, setForm] = useState(initialSettings);
    const [saveState, setSaveState] = useState({ type: '', message: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (status === 'succeeded') {
            setForm({
                weekly_active_goal: String(data.weekly_active_goal),
                timezone: data.timezone || 'UTC',
            });
        }
    }, [data, status]);

    const timezoneOptions = [...new Set([
        form.timezone,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...commonTimezones,
    ].filter(Boolean))];

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setSaveState({ type: '', message: '' });
        try {
            const saved = await saveLearningSettings({
                weekly_active_goal: Number(form.weekly_active_goal),
                timezone: form.timezone,
            });
            setForm({ weekly_active_goal: String(saved.weekly_active_goal), timezone: saved.timezone });
            setSaveState({ type: 'success', message: 'Preferences saved.' });
        } catch (saveError) {
            setSaveState({ type: 'error', message: saveError.message || 'Could not save your preferences.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="feature-page settings-page">
            <header className="feature-page-heading">
                <p className="eyebrow">YOUR PREFERENCES</p>
                <h1>Settings</h1>
                <p>Set a learning rhythm that feels sustainable for you.</p>
            </header>

            {!user && <p className="settings-message">Sign in to manage your settings.</p>}
            {user && status === 'loading' && <p className="settings-message">Loading your settings...</p>}
            {user && status === 'failed' && <p className="settings-message settings-error" role="alert">{error}</p>}
            {user && <section className="settings-section account-section">
                <div className="settings-section-heading">
                    <span className="settings-icon account-icon" aria-hidden="true">{user.username?.slice(0, 2).toUpperCase() || 'AM'}</span>
                    <div><h2>Your account</h2><p>Signed in as {user.username || 'Learner'} · {user.email}</p></div>
                </div>
            </section>}
            {user && status === 'succeeded' && <form className="settings-form" onSubmit={handleSubmit}>
                <section className="settings-section">
                    <div className="settings-section-heading">
                        <span className="settings-icon" aria-hidden="true">✦</span>
                        <div><h2>Weekly activity goal</h2><p>Choose how many days you want to make learning progress each week.</p></div>
                    </div>
                    <label className="settings-field">
                        <span>Active days each week</span>
                        <select value={form.weekly_active_goal} onChange={(event) => setForm((current) => ({ ...current, weekly_active_goal: event.target.value }))}>
                            {[1, 2, 3, 4, 5, 6, 7].map((days) => <option key={days} value={days}>{days} {days === 1 ? 'day' : 'days'} per week</option>)}
                        </select>
                    </label>
                </section>

                <section className="settings-section">
                    <div className="settings-section-heading">
                        <span className="settings-icon timezone-icon" aria-hidden="true">◷</span>
                        <div><h2>Time zone</h2><p>Used to decide which local day your learning activity belongs to.</p></div>
                    </div>
                    <label className="settings-field">
                        <span>Your time zone</span>
                        <select value={form.timezone} onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}>
                            {timezoneOptions.map((timezone) => <option key={timezone} value={timezone}>{getTimezoneLabel(timezone)}</option>)}
                        </select>
                    </label>
                </section>

                <div className="settings-actions">
                    <p className={`settings-save-state ${saveState.type}`} role={saveState.type === 'error' ? 'alert' : 'status'}>{saveState.message}</p>
                    <button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : 'Save preferences'}</button>
                </div>
            </form>}
        </div>
    );
}
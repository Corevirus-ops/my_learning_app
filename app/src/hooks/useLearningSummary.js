import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getLearningSummary } from '../services/learningService';

export function useLearningSummary() {
    const user = useSelector((state) => state.user.user);
    const [summaryState, setSummaryState] = useState({ userId: null, summary: null, status: 'idle' });
    const currentState = user?.id === summaryState.userId
        ? summaryState
        : { summary: null, status: user ? 'loading' : 'idle' };

    useEffect(() => {
        if (!user) return undefined;

        let controller;
        const loadSummary = () => {
            controller?.abort();
            controller = new AbortController();
            getLearningSummary({ signal: controller.signal })
                .then((data) => {
                    setSummaryState({ userId: user.id, summary: data, status: 'succeeded' });
                })
                .catch((error) => {
                    if (error.name !== 'AbortError') {
                        setSummaryState({ userId: user.id, summary: null, status: 'failed' });
                    }
                });
        };

        loadSummary();
        window.addEventListener('learning-data-changed', loadSummary);
        return () => {
            controller?.abort();
            window.removeEventListener('learning-data-changed', loadSummary);
        };
    }, [user]);

    return currentState;
}
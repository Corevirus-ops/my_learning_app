import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getLearningSummary } from '../services/learningService';

export function useLearningSummary() {
    const user = useSelector((state) => state.user.user);
    const [summary, setSummary] = useState(null);
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        if (!user) {
            setSummary(null);
            setStatus('idle');
            return undefined;
        }

        let controller;
        const loadSummary = () => {
            controller?.abort();
            controller = new AbortController();
            setStatus('loading');
            getLearningSummary({ signal: controller.signal })
                .then((data) => {
                    setSummary(data);
                    setStatus('succeeded');
                })
                .catch((error) => {
                    if (error.name !== 'AbortError') setStatus('failed');
                });
        };

        loadSummary();
        window.addEventListener('learning-data-changed', loadSummary);
        return () => {
            controller?.abort();
            window.removeEventListener('learning-data-changed', loadSummary);
        };
    }, [user]);

    return { summary, status };
}
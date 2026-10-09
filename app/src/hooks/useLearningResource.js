import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export function useLearningResource(loader, initialData) {
    const user = useSelector((state) => state.user.user);
    const [data, setData] = useState(initialData);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            setData(initialData);
            setStatus('idle');
            setError('');
            return undefined;
        }

        let controller;
        const loadResource = () => {
            controller?.abort();
            controller = new AbortController();
            setStatus('loading');
            setError('');
            loader({ signal: controller.signal })
                .then((result) => {
                    setData(result);
                    setStatus('succeeded');
                })
                .catch((requestError) => {
                    if (requestError.name !== 'AbortError') {
                        setError(requestError.message || 'Could not load this information.');
                        setStatus('failed');
                    }
                });
        };

        loadResource();
        window.addEventListener('learning-data-changed', loadResource);
        return () => {
            controller?.abort();
            window.removeEventListener('learning-data-changed', loadResource);
        };
    }, [initialData, loader, user]);

    return { user, data, status, error };
}
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

        const controller = new AbortController();
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

        return () => controller.abort();
    }, [initialData, loader, user]);

    return { user, data, status, error };
}
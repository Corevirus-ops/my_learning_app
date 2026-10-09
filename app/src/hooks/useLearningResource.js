import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export function useLearningResource(loader, initialData) {
    const user = useSelector((state) => state.user.user);
    const [resource, setResource] = useState({ userId: null, data: initialData, status: 'idle', error: '' });
    const currentResource = user?.id === resource.userId
        ? resource
        : { data: initialData, status: user ? 'loading' : 'idle', error: '' };

    useEffect(() => {
        if (!user) return undefined;

        let controller;
        const loadResource = () => {
            controller?.abort();
            controller = new AbortController();
            loader({ signal: controller.signal })
                .then((result) => {
                    setResource({ userId: user.id, data: result, status: 'succeeded', error: '' });
                })
                .catch((requestError) => {
                    if (requestError.name !== 'AbortError') {
                        setResource({
                            userId: user.id,
                            data: initialData,
                            status: 'failed',
                            error: requestError.message || 'Could not load this information.',
                        });
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

    return { user, ...currentResource };
}
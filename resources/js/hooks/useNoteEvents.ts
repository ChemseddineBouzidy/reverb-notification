import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export const useNoteEvents = () => {
    useEffect(() => {
        const handleNoteCreated = (event: CustomEvent) => {
            console.log('Note created event received:', event.detail);
            // Refresh the current page to show new notes
            router.reload({ only: ['notes'] });
        };

        window.addEventListener('noteCreated', handleNoteCreated as EventListener);

        return () => {
            window.removeEventListener('noteCreated', handleNoteCreated as EventListener);
        };
    }, []);
};

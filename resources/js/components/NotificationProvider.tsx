import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    timestamp: string;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

declare global {
    interface Window {
        Echo: any;
    }
}

interface NotificationProviderProps {
    children: ReactNode;
    userId?: number;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, userId }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Wait for Echo to be available
        const checkEcho = () => {
            if (typeof window !== 'undefined' && window.Echo) {
                setupEchoListeners();
            } else {
                setTimeout(checkEcho, 100);
            }
        };

        const setupEchoListeners = () => {
            try {
                // Listen to private channel for user-specific notifications
                if (userId) {
                    const privateChannel = window.Echo.private(`notifications.${userId}`);

                    privateChannel.listen('.notification.sent', (e: any) => {
                        console.log('Private notification received:', e);
                        addNotification({
                            message: e.message,
                            type: e.type || 'info',
                            timestamp: e.timestamp || new Date().toISOString(),
                        });
                    });

                    // Listen for note-related events
                    privateChannel.listen('.note.created', (e: any) => {
                        console.log('Nouvelle note reçue:', e);
                        // Show notification for new note
                        addNotification({
                            message: e.message || `Nouvelle note créée: ${e.note?.title || 'Sans titre'}`,
                            type: 'success',
                            timestamp: new Date().toISOString(),
                        });

                        // Trigger page refresh or update notes list
                        // You might want to dispatch a custom event here to update the notes list
                        window.dispatchEvent(new CustomEvent('noteCreated', { detail: e }));
                    });
                }

                // Listen to public channel for general notifications
                const publicChannel = window.Echo.channel('notifications');

                publicChannel.listen('.notification.sent', (e: any) => {
                    console.log('Public notification received:', e);
                    addNotification({
                        message: e.message,
                        type: e.type || 'info',
                        timestamp: e.timestamp || new Date().toISOString(),
                    });
                });

                // Listen for public note events
                publicChannel.listen('.note.created', (e: any) => {
                    console.log('Public note event received:', e);
                    addNotification({
                        message: e.message || `${e.author?.name || 'Quelqu\'un'} a créé une nouvelle note`,
                        type: 'info',
                        timestamp: new Date().toISOString(),
                    });

                    // Trigger page refresh or update notes list
                    window.dispatchEvent(new CustomEvent('noteCreated', { detail: e }));
                });

            } catch (error) {
                console.error('Error setting up Echo listeners:', error);
            }
        };

        checkEcho();

        return () => {
            if (typeof window !== 'undefined' && window.Echo) {
                try {
                    if (userId) {
                        window.Echo.leave(`notifications.${userId}`);
                    }
                    window.Echo.leave('notifications');
                } catch (error) {
                    console.error('Error cleaning up Echo listeners:', error);
                }
            }
        };
    }, [userId]);

    const addNotification = (notification: Omit<Notification, 'id'>) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newNotification = { ...notification, id };

        setNotifications(prev => [...prev, newNotification]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            addNotification,
            removeNotification,
            clearAll
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

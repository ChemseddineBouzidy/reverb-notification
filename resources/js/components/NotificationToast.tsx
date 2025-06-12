import React from 'react';
import { useNotifications } from './NotificationProvider';

const NotificationToast: React.FC = () => {
    const { notifications, removeNotification } = useNotifications();

    const getToastStyles = (type: string) => {
        const baseStyles = 'p-4 mb-3 rounded-lg shadow-lg transition-all duration-300 transform animate-slide-in';
        const typeStyles = {
            success: 'bg-green-500 text-white border-l-4 border-green-600',
            error: 'bg-red-500 text-white border-l-4 border-red-600',
            warning: 'bg-yellow-500 text-black border-l-4 border-yellow-600',
            info: 'bg-blue-500 text-white border-l-4 border-blue-600',
        };
        return `${baseStyles} ${typeStyles[type as keyof typeof typeStyles] || typeStyles.info}`;
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'info':
            default:
                return (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={getToastStyles(notification.type)}
                >
                    <div className="flex items-start">
                        {getIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm leading-5">
                                {notification.message}
                            </p>
                            <p className="text-xs opacity-75 mt-1">
                                {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="ml-3 text-lg font-bold opacity-75 hover:opacity-100 transition-opacity"
                            aria-label="Fermer la notification"
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationToast;

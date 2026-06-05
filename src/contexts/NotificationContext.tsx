import { createContext, useContext } from 'react';

type NotificationContextValue = {
  notifBlocked: boolean;
};

export const NotificationContext = createContext<NotificationContextValue>({
  notifBlocked: false,
});

export function useNotificationContext() {
  return useContext(NotificationContext);
}

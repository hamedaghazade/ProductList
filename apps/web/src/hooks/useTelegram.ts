import { useEffect, useMemo } from 'react';

export const useTelegram = () => {
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    tg?.ready();
    tg?.expand();
  }, [tg]);

  const user = useMemo(() => tg?.initDataUnsafe?.user, [tg]);

  const haptic = {
    impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => tg?.HapticFeedback?.impactOccurred(style),
    success: () => tg?.HapticFeedback?.notificationOccurred('success'),
    error: () => tg?.HapticFeedback?.notificationOccurred('error'),
  };

  return { tg, user, haptic };
};
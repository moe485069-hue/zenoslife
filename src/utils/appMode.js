/**
 * ============================================================================
 * 🎯 Zen Ecosystem Multi-App Mode Resolver
 * Automatically detects whether the Mini App is running inside:
 * 1. 'chazha' -> Chazha Games & Arcade (@chazha_bot)
 * 2. 'whoza'  -> Whoza Anonymous Chat & Dating (@whoza_bot)
 * 3. 'zenos'  -> ZenOsLife LifeOS, Realms & Self-Discovery (@zenosaaa_bot)
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function resolveAppMode(pathname = '') {
  if (typeof window === 'undefined') return 'zenos';

  // 1. Check window.location.search (?app=chazha | ?app=whoza | ?app=zenos)
  const searchParams = new URLSearchParams(window.location.search);
  const searchApp = searchParams.get('app') || searchParams.get('mode');
  if (searchApp === 'chazha' || searchApp === 'games') {
    sessionStorage.setItem('zen_app_mode', 'chazha');
    return 'chazha';
  }
  if (searchApp === 'whoza' || searchApp === 'chat' || searchApp === 'dating') {
    sessionStorage.setItem('zen_app_mode', 'whoza');
    return 'whoza';
  }
  if (searchApp === 'zenos' || searchApp === 'lifeos') {
    sessionStorage.setItem('zen_app_mode', 'zenos');
    return 'zenos';
  }

  // 2. Check hash query params (e.g. #/games?app=chazha)
  const hash = window.location.hash || '';
  if (hash.includes('?')) {
    const hashQuery = hash.split('?')[1];
    const hashParams = new URLSearchParams(hashQuery);
    const hashApp = hashParams.get('app') || hashParams.get('mode');
    if (hashApp === 'chazha' || hashApp === 'games') {
      sessionStorage.setItem('zen_app_mode', 'chazha');
      return 'chazha';
    }
    if (hashApp === 'whoza' || hashApp === 'chat' || hashApp === 'dating') {
      sessionStorage.setItem('zen_app_mode', 'whoza');
      return 'whoza';
    }
    if (hashApp === 'zenos' || hashApp === 'lifeos') {
      sessionStorage.setItem('zen_app_mode', 'zenos');
      return 'zenos';
    }
  }

  // 3. Check Telegram WebApp start_param
  const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
  if (startParam === 'chazha' || startParam === 'games') {
    sessionStorage.setItem('zen_app_mode', 'chazha');
    return 'chazha';
  }
  if (startParam === 'whoza' || startParam === 'chat') {
    sessionStorage.setItem('zen_app_mode', 'whoza');
    return 'whoza';
  }
  if (startParam === 'zenos') {
    sessionStorage.setItem('zen_app_mode', 'zenos');
    return 'zenos';
  }

  // 4. Check persistent sessionStorage
  const savedMode = sessionStorage.getItem('zen_app_mode');
  if (savedMode && ['chazha', 'whoza', 'zenos'].includes(savedMode)) {
    // If the user deliberately navigated to /games or /chat, adjust mode if needed
    if (pathname.startsWith('/games') && savedMode !== 'chazha') {
      sessionStorage.setItem('zen_app_mode', 'chazha');
      return 'chazha';
    }
    if (pathname.startsWith('/chat') && savedMode !== 'whoza') {
      sessionStorage.setItem('zen_app_mode', 'whoza');
      return 'whoza';
    }
    return savedMode;
  }

  // 5. Fallback detection based on path
  const currentPath = pathname || (window.location.hash.replace('#', '').split('?')[0]) || window.location.pathname;
  if (currentPath.startsWith('/games')) {
    sessionStorage.setItem('zen_app_mode', 'chazha');
    return 'chazha';
  }
  if (currentPath.startsWith('/chat') || currentPath.startsWith('/dating')) {
    sessionStorage.setItem('zen_app_mode', 'whoza');
    return 'whoza';
  }

  return 'zenos';
}

export function useAppMode() {
  const location = useLocation();
  const [appMode, setAppMode] = useState(() => resolveAppMode(location.pathname));

  useEffect(() => {
    const detected = resolveAppMode(location.pathname);
    setAppMode(detected);
  }, [location.pathname, location.search]);

  return appMode;
}

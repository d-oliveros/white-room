import type { GetAuthMe200 } from '@namespace/api-client';
import { parseJSON } from '@namespace/util';
import { useGetAuthMe } from '@namespace/api-client';
import { useState } from 'react';

const USER_SESSION_CACHE_KEY = 'user_session_cache';

export default function useCurrentUser() {
  // Initialize with cached user if available
  const [cachedUser] = useState<GetAuthMe200 | null>(() => {
    const cached = localStorage.getItem(USER_SESSION_CACHE_KEY);
    return cached ? (parseJSON(cached) as GetAuthMe200) : null;
  });

  const { isLoading, data: { data: user } = { data: null } } = useGetAuthMe({
    query: {
      retry: 0,
      staleTime: 12 * 60 * 60 * 1000, // 12 hours
    },
  });

  // Update localStorage and state when user data changes
  // useEffect(() => {
  //   if (isLoading) {
  //     return;
  //   }
  //   if (user) {
  //     localStorage.setItem(USER_SESSION_CACHE_KEY, JSON.stringify(user));
  //     setCachedUser(user);
  //   } else {
  //     localStorage.removeItem(USER_SESSION_CACHE_KEY);
  //     setCachedUser(null);
  //   }
  // }, [user, isLoading]);

  // Return cached user while loading, or the actual user once loaded
  return {
    user: cachedUser || user,
    isLoading: cachedUser ? false : isLoading,
  };
}

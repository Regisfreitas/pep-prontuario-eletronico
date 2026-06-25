import { useCallback, useEffect, useState } from 'react';
import { checkBackendHealth } from '../config/api';

export function useBackendHealth() {
  const [online, setOnline] = useState(null);

  const ping = useCallback(async () => {
    const ok = await checkBackendHealth();
    setOnline(ok);
    return ok;
  }, []);

  useEffect(() => {
    ping();
    const interval = setInterval(ping, 10000);
    return () => clearInterval(interval);
  }, [ping]);

  return { online, ping };
}

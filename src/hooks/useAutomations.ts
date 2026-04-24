import { useState, useEffect } from 'react';
import { getAutomations } from '../services/api';
import type { AutomationAction } from '../types/nodeTypes';

interface UseAutomationsResult {
  automations: AutomationAction[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches and caches the list of available automated actions from the mock API.
 */
export function useAutomations(): UseAutomationsResult {
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAutomations()
      .then((data) => { if (!cancelled) setAutomations(data); })
      .catch((err) => { if (!cancelled) setError(String(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { automations, loading, error };
}

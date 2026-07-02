import { useEffect, useMemo, useState } from 'react';
import type { DependencyList } from 'react';
import { emailNotificationService } from '@/services/emailNotification';
import type { EmailNotificationRequest, EmailNotificationResult } from '@/types';

interface EmailNotificationResourceState<T> {
  data: T | null;
  loading: boolean;
  error: unknown;
}

function useEmailNotificationResource<T>(load: () => Promise<T> | null, dependencies: DependencyList): EmailNotificationResourceState<T> {
  const [state, setState] = useState<EmailNotificationResourceState<T>>({ data: null, loading: false, error: null });

  useEffect(() => {
    let active = true;
    const pending = load();
    if (!pending) {
      setState({ data: null, loading: false, error: null });
      return () => { active = false; };
    }
    setState((current) => ({ ...current, loading: true, error: null }));
    pending.then((data) => {
      if (active) setState({ data, loading: false, error: null });
    }).catch((error) => {
      if (active) setState({ data: null, loading: false, error });
    });
    return () => { active = false; };
  }, dependencies);

  return state;
}

export function useEmailNotification(request: EmailNotificationRequest | null | undefined): EmailNotificationResourceState<EmailNotificationResult> {
  return useEmailNotificationResource(() => (request ? emailNotificationService.notify(request) : null), [request]);
}

export function useQuoteNotificationTemplates() {
  return useMemo(() => emailNotificationService.templates, []);
}

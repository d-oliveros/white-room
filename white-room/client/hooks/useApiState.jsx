import { initialApiActionState } from '#api/createApiClient.js';
import useBranch from '#client/hooks/useBranch.js';

export default function useApiState(apiActionSetting, opts = {}) {
  apiActionSetting = typeof apiActionSetting === 'string'
    ? { action: apiActionSetting }
    : apiActionSetting;

  const { apiState } = useBranch(({
    apiState: [
      opts.statePath || 'apiState',
      apiActionSetting.action,
      apiActionSetting.queryId ? `${apiActionSetting.queryId}` : 'default',
    ],
  }));

  return apiState || initialApiActionState;
}

import { initialApiActionState } from '#white-room/api/createApiClient.js';
import useBranch from '#white-room/client/hooks/useBranch.js';

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

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lineupsApi, SyncLineupsRequest } from '../api-client';

export function useSyncLineups() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SyncLineupsRequest) => lineupsApi.syncLineups(request),
    onSuccess: () => {
      // Invalidate drivers and constructors queries since lineups affect filtering and sorting
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      queryClient.invalidateQueries({ queryKey: ['constructors'] });
    },
  });
}

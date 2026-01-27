import { useMutation, useQueryClient } from '@tanstack/react-query';
import { driversApi, SyncDriversRequest } from '../api-client';

export function useSyncDrivers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request?: SyncDriversRequest) => driversApi.syncDrivers(request),
    onSuccess: () => {
      // Invalidate all drivers queries to refetch after sync
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

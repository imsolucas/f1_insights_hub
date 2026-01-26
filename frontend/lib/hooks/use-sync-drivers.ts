import { useMutation, useQueryClient } from '@tanstack/react-query';
import { driversApi } from '../api-client';

export function useSyncDrivers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (seasons?: number[]) => driversApi.syncDrivers(seasons),
    onSuccess: () => {
      // Invalidate drivers query to refetch after sync
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

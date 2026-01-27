import { useMutation, useQueryClient } from '@tanstack/react-query';
import { constructorsApi, SyncConstructorsRequest } from '../api-client';

export function useSyncConstructors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request?: SyncConstructorsRequest) => constructorsApi.syncConstructors(request),
    onSuccess: () => {
      // Invalidate all constructors queries to refetch after sync
      queryClient.invalidateQueries({ queryKey: ['constructors'] });
    },
  });
}

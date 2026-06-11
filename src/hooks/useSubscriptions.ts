import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { subscriptionsService } from "@/services/subscription.service";
import type {
  CreateSubscriptionDto,
  ExtendSubscriptionDto,
  PaginationParams,
  UpdateSubscriptionStatusDto,
  UpdateSubscriptionDto,
} from "@/types/subscription.types";

export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  lists: () => [...subscriptionKeys.all, "list"] as const,
  list: (params: PaginationParams) =>
    [...subscriptionKeys.lists(), params] as const,
  details: () => [...subscriptionKeys.all, "detail"] as const,
  detail: (id: number) => [...subscriptionKeys.details(), id] as const,
};

export function useSubscriptions(params: PaginationParams = {}) {
  return useQuery({
    queryKey: subscriptionKeys.list(params),
    queryFn: () => subscriptionsService.findAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useSubscription(id: number) {
  return useQuery({
    queryKey: subscriptionKeys.detail(id),
    queryFn: () => subscriptionsService.findOne(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

function invalidateSubscriptions(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["organizations"] });
  return queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSubscriptionDto) =>
      subscriptionsService.create(dto),
    onSuccess: () => invalidateSubscriptions(queryClient),
  });
}

export function useUpdateSubscription(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateSubscriptionDto) =>
      subscriptionsService.update(id, dto),
    onSuccess: (subscription) => {
      queryClient.setQueryData(subscriptionKeys.detail(id), subscription);
      invalidateSubscriptions(queryClient);
    },
  });
}

export function useExtendSubscription(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ExtendSubscriptionDto) =>
      subscriptionsService.extend(id, dto),
    onSuccess: (subscription) => {
      queryClient.setQueryData(subscriptionKeys.detail(id), subscription);
      invalidateSubscriptions(queryClient);
    },
  });
}

export function usePauseSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => subscriptionsService.pause(id),
    onSuccess: (subscription, id) => {
      queryClient.setQueryData(subscriptionKeys.detail(id), subscription);
      invalidateSubscriptions(queryClient);
    },
  });
}

export function useUpdateSubscriptionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: UpdateSubscriptionStatusDto & { id: number }) =>
      subscriptionsService.updateStatus(id, { status }),
    onSuccess: (subscription, variables) => {
      queryClient.setQueryData(
        subscriptionKeys.detail(variables.id),
        subscription,
      );
      invalidateSubscriptions(queryClient);
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => subscriptionsService.remove(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: subscriptionKeys.detail(id) });
      invalidateSubscriptions(queryClient);
    },
  });
}

import { subscriptionsService } from "@/services/subscription.service";
import { PaginationParams } from "@/types/common.types";
import { CreateSubscriptionDto, UpdateSubscriptionDto, ExtendSubscriptionDto } from "@/types/subscription.types";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";


// ─── Keys ─────────────────────────────────────────────────────────────────────

export const subKeys = {
  all: ["subscriptions"] as const,
  lists: () => [...subKeys.all, "list"] as const,
  list: (p: PaginationParams) => [...subKeys.lists(), p] as const,
  detail: (id: number) => [...subKeys.all, id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useSubscriptions(params: PaginationParams = {}) {
  return useQuery({
    queryKey: subKeys.list(params),
    queryFn: () => subscriptionsService.findAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useSubscription(id: number) {
  return useQuery({
    queryKey: subKeys.detail(id),
    queryFn: () => subscriptionsService.findOne(id),
    enabled: !!id,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSubscriptionDto) =>
      subscriptionsService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: subKeys.lists() });
    },
  });
}

export function useUpdateSubscription(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateSubscriptionDto) =>
      subscriptionsService.update(id, dto),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: subKeys.lists() });
      qc.setQueryData(subKeys.detail(id), updated);
    },
  });
}

export function useExtendSubscription(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: ExtendSubscriptionDto) =>
      subscriptionsService.extend(id, dto),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: subKeys.lists() });
      qc.setQueryData(subKeys.detail(id), updated);
    },
  });
}

export function usePauseSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => subscriptionsService.pause(id),
    onSuccess: (updated, id) => {
      qc.invalidateQueries({ queryKey: subKeys.lists() });
      qc.setQueryData(subKeys.detail(id), updated);
    },
  });
}

export function useDeleteSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => subscriptionsService.remove(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: subKeys.lists() });
      qc.removeQueries({ queryKey: subKeys.detail(id) });
    },
  });
}

import { organizationsService } from "@/services/organization.service";
import { PaginationParams } from "@/types/common.types";
import { CreateOrganizationDto, UpdateOrganizationDto } from "@/types/organization.types";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";


// ─── Keys ─────────────────────────────────────────────────────────────────────

export const orgKeys = {
  all: ["organizations"] as const,
  lists: () => [...orgKeys.all, "list"] as const,
  list: (p: PaginationParams) => [...orgKeys.lists(), p] as const,
  detail: (id: number) => [...orgKeys.all, id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useOrganizations(params: PaginationParams = {}) {
  return useQuery({
    queryKey: orgKeys.list(params),
    queryFn: () => organizationsService.findAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useOrganization(id: number) {
  return useQuery({
    queryKey: orgKeys.detail(id),
    queryFn: () => organizationsService.findOne(id),
    enabled: !!id,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOrganizationDto) =>
      organizationsService.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orgKeys.lists() });
    },
  });
}

export function useUpdateOrganization(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateOrganizationDto) =>
      organizationsService.update(id, dto),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: orgKeys.lists() });
      qc.setQueryData(orgKeys.detail(id), updated);
    },
  });
}

export function useDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => organizationsService.remove(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: orgKeys.lists() });
      qc.removeQueries({ queryKey: orgKeys.detail(id) });
    },
  });
}

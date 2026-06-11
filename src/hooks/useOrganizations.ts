import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { organizationsService } from "@/services/organization.service";
import type {
  CreateOrganizationDto,
  PaginationParams,
  UpdateOrganizationDto,
} from "@/types/organization.types";

export const organizationKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
  list: (params: PaginationParams) =>
    [...organizationKeys.lists(), params] as const,
  details: () => [...organizationKeys.all, "detail"] as const,
  detail: (id: number) => [...organizationKeys.details(), id] as const,
};

export function useOrganizations(params: PaginationParams = {}) {
  return useQuery({
    queryKey: organizationKeys.list(params),
    queryFn: () => organizationsService.findAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useOrganization(id: number) {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: () => organizationsService.findOne(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      dto,
      logo,
    }: {
      dto: CreateOrganizationDto;
      logo?: File | null;
    }) => {
      const result = await organizationsService.create(dto);
      if (logo) {
        result.organization = await organizationsService.uploadLogo(
          result.organization.id,
          logo,
        );
      }
      return result;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() }),
  });
}

export function useUpdateOrganization(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      dto,
      logo,
    }: {
      dto: UpdateOrganizationDto;
      logo?: File | null;
    }) => {
      const organization = await organizationsService.update(id, dto);
      return logo
        ? organizationsService.uploadLogo(organization.id, logo)
        : organization;
    },
    onSuccess: (organization) => {
      queryClient.setQueryData(organizationKeys.detail(id), organization);
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => organizationsService.remove(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: organizationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
  });
}

export function useResetOrganizationAdminPassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) =>
      organizationsService.resetAdminPassword(id, newPassword),
  });
}

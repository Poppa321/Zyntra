import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProfile, updateProfile } from "@/api/endpoints/profile";
import { mapBusinessProfile } from "@/api/mappers";
import { businessProfile as sampleBusinessProfile, type BusinessProfile } from "@/data/sampleData";
import type { BusinessProfileDto } from "@/api/types";

const PROFILE_KEY = ["business-profile"];

export function useProfileQuery() {
  const query = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => getProfile().then(mapBusinessProfile),
    initialData: sampleBusinessProfile,
    staleTime: Infinity,
  });

  return { ...query, data: query.data ?? sampleBusinessProfile };
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: BusinessProfile) => {
      queryClient.setQueryData<BusinessProfile>(PROFILE_KEY, input);

      const payload: Partial<BusinessProfileDto> = { ...input };
      return updateProfile(payload).catch(() => null);
    },
  });
}

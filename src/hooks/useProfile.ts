import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as authApi from "@/api/endpoints/auth";
import { mapBusinessProfile } from "@/api/mappers";
import type { BusinessProfile } from "@/types/domain";

const PROFILE_KEY = ["business-profile"];

const EMPTY_PROFILE: BusinessProfile = {
  fullName: "",
  companyName: "",
  email: "",
  phone: "",
  location: "",
  description: "",
};

export function useProfileQuery() {
  const query = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: () => authApi.me().then(mapBusinessProfile),
  });

  return { ...query, data: query.data ?? EMPTY_PROFILE };
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BusinessProfile) =>
      authApi
        .updateMe({
          fullName: input.fullName,
          businessName: input.companyName || undefined,
          phone: input.phone || undefined,
          city: input.location || undefined,
          description: input.description || undefined,
        })
        .then(mapBusinessProfile),
    onSuccess: (profile) => {
      queryClient.setQueryData<BusinessProfile>(PROFILE_KEY, profile);
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}

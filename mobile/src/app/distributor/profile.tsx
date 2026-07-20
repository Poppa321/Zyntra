import { ProfileScreen } from "@/components/ProfileScreen";
import { useSessionQuery } from "@/hooks/useAuth";

export default function DistributorProfile() {
  const { data: user } = useSessionQuery();
  const name = user?.businessName || user?.fullName || "Distributor";
  const roleLabel = `Distributor${user?.city ? ` · ${user.city}` : ""}`;
  return <ProfileScreen name={name} roleLabel={roleLabel} />;
}

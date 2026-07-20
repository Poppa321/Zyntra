import { ProfileScreen } from "@/components/ProfileScreen";
import { useSessionQuery } from "@/hooks/useAuth";

export default function ManufacturerProfile() {
  const { data: user } = useSessionQuery();
  const name = user?.businessName || user?.fullName || "Manufacturer";
  const roleLabel = `Manufacturer${user?.city ? ` · ${user.city}` : ""}`;
  return <ProfileScreen name={name} roleLabel={roleLabel} />;
}

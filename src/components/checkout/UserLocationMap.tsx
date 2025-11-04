// @/components/checkout/UserLocationMap.tsx
import React from "react";
import { validateEnv } from "@/utils/appwrite";
import { useUserMap } from "@/hooks/useUserMap";

interface UserLocationMapProps {
  userLocation: { lat: number; lng: number } | null;
  address: string;
  onNewAddressPicked: (newAddress: string) => void;
}

const UserLocationMap: React.FC<UserLocationMapProps> = ({
  userLocation,
  address,
  onNewAddressPicked,
}) => {
  const { googleMapsApiKey } = validateEnv();
  useUserMap(userLocation, address, googleMapsApiKey, onNewAddressPicked);

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden">
      <div id="user-location-map" className="w-full h-full" />
    </div>
  );
};

export default UserLocationMap;

// @/hooks/useUserMap.ts
import { useEffect, useRef } from "react";

export function useUserMap(
  userLocation: { lat: number; lng: number } | null,
  address: string,
  googleMapsApiKey: string,
  onNewAddressPicked: (newAddress: string) => void
) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (!googleMapsApiKey || !window.google?.maps) return;

    const mapDiv = document.getElementById("user-location-map");
    if (!mapDiv) return;

    const center = userLocation || { lat: 5.47631, lng: 7.025853 }; // Default to Owerri if no user location

    mapRef.current = new window.google.maps.Map(mapDiv, {
      center,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      mapId: "DEMO_MAP_ID", // Required for advanced markers; replace with your own map ID if needed
    });

    geocoderRef.current = new window.google.maps.Geocoder();

    markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
      position: center,
      map: mapRef.current,
      title: address || "Your Location",
      gmpDraggable: true,
    });

    // Map click listener
    mapRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng && geocoderRef.current && markerRef.current) {
        markerRef.current.position = e.latLng;
        geocoderRef.current.geocode(
          { location: e.latLng },
          (results, status) => {
            if (status === "OK" && results?.[0]) {
              const newAddress = results[0].formatted_address;
              onNewAddressPicked(newAddress);
            }
          }
        );
      }
    });

    // Draggable marker listener
    markerRef.current.addListener("dragend", () => {
      if (markerRef.current?.position && geocoderRef.current) {
        const position = markerRef.current.position;
        geocoderRef.current.geocode(
          { location: position },
          (results, status) => {
            if (status === "OK" && results?.[0]) {
              const newAddress = results[0].formatted_address;
              onNewAddressPicked(newAddress);
            }
          }
        );
      }
    });

    // If address is provided, geocode it and update center/marker
    if (address && geocoderRef.current) {
      geocoderRef.current.geocode(
        { address, componentRestrictions: { country: "ng" } },
        (results, status) => {
          if (status === "OK" && results?.[0]?.geometry?.location) {
            const location = results[0].geometry.location;
            const newCenter = { lat: location.lat(), lng: location.lng() };
            mapRef.current?.setCenter(newCenter);
            if (markerRef.current) {
              markerRef.current.position = new google.maps.LatLng(
                newCenter.lat,
                newCenter.lng
              );
              markerRef.current.title = results[0].formatted_address;
            }
          }
        }
      );
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
      if (mapRef.current) {
        google.maps.event.clearInstanceListeners(mapRef.current);
        mapRef.current = null;
      }
      if (geocoderRef.current) {
        geocoderRef.current = null;
      }
    };
  }, [userLocation, address, googleMapsApiKey, onNewAddressPicked]);

  return { mapRef, markerRef };
}

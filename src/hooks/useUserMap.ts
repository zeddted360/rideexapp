// hooks/useUserMap.ts (final version)
import { useEffect, useRef } from "react";
import { useGlobalMapControl } from "./useGlobalMapControl";

export function useUserMap(
  userLocation: { lat: number; lng: number } | null,
  address: string,
  googleMapsApiKey: string,
  onNewAddressPicked: (newAddress: string) => void
) {
  const { isPaused: isMapPaused, loading: pauseLoading } =
    useGlobalMapControl();


  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    // Wait for pause status
    if (pauseLoading || isMapPaused === null) return;

    const mapDiv = document.getElementById("user-location-map");
    if (!mapDiv) return;

    // If globally paused → show message, no map
    if (isMapPaused) {
      mapDiv.innerHTML = `
        <div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#111;color:white;text-align:center;padding:20px;">
          <h3 style="font-size:1.5rem;margin-bottom:1rem;">Map Temporarily Unavailable</h3>
          <p style="max-width:400px;">We're performing maintenance. Map features will be back soon. Thank you for your patience!</p>
        </div>
      `;
      return;
    }

    // Normal map initialization (only if not paused)
    if (!googleMapsApiKey || !window.google?.maps) return;

    const center = userLocation || { lat: 5.47631, lng: 7.025853 };

    mapRef.current = new window.google.maps.Map(mapDiv, {
      center,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      mapId: "DEMO_MAP_ID",
    });

    geocoderRef.current = new window.google.maps.Geocoder();

    markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
      position: center,
      map: mapRef.current,
      title: address || "Your Location",
      gmpDraggable: true,
    });

    // All interactive features only when not paused
    mapRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (e.latLng && geocoderRef.current && markerRef.current) {
        markerRef.current.position = e.latLng;
        geocoderRef.current.geocode(
          { location: e.latLng },
          (results, status) => {
            if (status === "OK" && results?.[0]) {
              onNewAddressPicked(results[0].formatted_address);
            }
          }
        );
      }
    });

    markerRef.current.addListener("dragend", () => {
      if (markerRef.current?.position && geocoderRef.current) {
        const pos = markerRef.current.position;
        geocoderRef.current.geocode({ location: pos }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            onNewAddressPicked(results[0].formatted_address);
          }
        });
      }
    });

    // Geocode address if provided
    if (address && geocoderRef.current) {
      geocoderRef.current.geocode(
        { address, componentRestrictions: { country: "ng" } },
        (results, status) => {
          if (status === "OK" && results?.[0]?.geometry?.location) {
            const loc = results[0].geometry.location;
            mapRef.current?.setCenter({ lat: loc.lat(), lng: loc.lng() });
            if (markerRef.current) {
              markerRef.current.position = new google.maps.LatLng(
                loc.lat(),
                loc.lng()
              );
            }
          }
        }
      );
    }

    return () => {
      if (markerRef.current) markerRef.current.map = null;
      if (mapRef.current)
        google.maps.event.clearInstanceListeners(mapRef.current);
      mapRef.current = null;
      markerRef.current = null;
      geocoderRef.current = null;
    };
  }, [
    userLocation,
    address,
    googleMapsApiKey,
    onNewAddressPicked,
    isMapPaused,
    pauseLoading,
  ]);

  return {
    mapRef,
    markerRef,
    isMapReady: !pauseLoading && isMapPaused === false,
  };
}

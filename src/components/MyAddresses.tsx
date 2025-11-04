"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Trash2, X, Loader2, CheckCircle } from "lucide-react";
import { account, databases, validateEnv } from "@/utils/appwrite";
import { Loader } from "@googlemaps/js-api-loader";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const MyAddresses = () => {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [apartmentFlat, setApartmentFlat] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addressMode, setAddressMode] = useState<"search" | "map" | "manual">(
    "search"
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [pickedLocation, setPickedLocation] =
    useState<google.maps.LatLng | null>(null);
  const autocompleteInput = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const currentMarkerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const dragendListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const clickListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const userData = await account.get();
        const { databaseId, userCollectionId } = validateEnv();
        const userDoc = await databases.getDocument(
          databaseId,
          userCollectionId,
          userData.$id
        );
        if (Array.isArray(userDoc.address)) {
          setAddresses(userDoc.address);
        } else {
          setAddresses([]);
        }
      } catch {
        setAddresses([]);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const { googleMapsApiKey } = validateEnv();
    if (!googleMapsApiKey) return;
    const loader = new Loader({
      apiKey: googleMapsApiKey,
      version: "weekly",
      libraries: ["places", "geometry", "marker"],
    });
    loader.load().then(() => setMapLoaded(true));
  }, []);

  useEffect(() => {
    if (
      mapLoaded &&
      showAddForm &&
      addressMode === "search" &&
      autocompleteInput.current &&
      !autocompleteRef.current
    ) {
      const imoSouthWest = new window.google.maps.LatLng(4.75, 6.83);
      const imoNorthEast = new window.google.maps.LatLng(5.92, 7.42);
      const imoBounds = new window.google.maps.LatLngBounds(
        imoSouthWest,
        imoNorthEast
      );

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        autocompleteInput.current,
        {
          types: [],
          componentRestrictions: { country: "ng" },
          bounds: imoBounds,
          strictBounds: false,
        }
      );
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.formatted_address) {
          setNewAddress(place.formatted_address);
          if (place.geometry?.location) {
            const latlng = place.geometry.location;
            setPickedLocation(latlng);
            setAddressMode("map"); // Switch to map mode to show centered on selected place
          }
        } else if (place?.name) {
          setNewAddress(place.name);
        }
      });
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [mapLoaded, showAddForm, addressMode]);

  useEffect(() => {
    if (
      showAddForm &&
      addressMode === "map" &&
      mapLoaded &&
      mapRef.current &&
      !mapInstance.current
    ) {
      geocoderRef.current = new window.google.maps.Geocoder();
      const center =
        pickedLocation ||
        (userLocation
          ? new window.google.maps.LatLng(userLocation.lat, userLocation.lng)
          : new window.google.maps.LatLng(5.4768, 7.0308));
      const zoom = pickedLocation || userLocation ? 15 : 10;

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom,
        mapTypeId: "roadmap" as google.maps.MapTypeId,
      });

      // Add current location marker if available and no picked location
      if (userLocation && !pickedLocation && !currentMarkerRef.current) {
        currentMarkerRef.current = new window.google.maps.Marker({
          position: new window.google.maps.LatLng(
            userLocation.lat,
            userLocation.lng
          ),
          map: mapInstance.current,
          title: "Your Current Location",
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          },
        });
      }

      // Create draggable marker if pickedLocation exists
      if (pickedLocation && !markerRef.current) {
        markerRef.current = new window.google.maps.Marker({
          position: pickedLocation,
          map: mapInstance.current,
          draggable: true,
          title: "Drag to adjust location",
        });
      }

      // Add dragend listener if marker exists
      if (markerRef.current && !dragendListenerRef.current) {
        dragendListenerRef.current = google.maps.event.addListener(
          markerRef.current,
          "dragend",
          (event: google.maps.MapMouseEvent) => {
            const latlng = event.latLng;
            if (!latlng) return;
            setPickedLocation(latlng);

            // Reverse geocode
            geocoderRef.current?.geocode(
              { location: latlng },
              (results, status) => {
                if (
                  status === window.google.maps.GeocoderStatus.OK &&
                  results &&
                  results[0]
                ) {
                  setNewAddress(results[0].formatted_address || "");
                } else {
                  const lat = latlng.lat().toFixed(6);
                  const lng = latlng.lng().toFixed(6);
                  setNewAddress(`${lat}, ${lng}`);
                }
              }
            );
          }
        );
      }

      // Add click listener to place or move marker
      if (!clickListenerRef.current) {
        clickListenerRef.current = google.maps.event.addListener(
          mapInstance.current,
          "click",
          (event: google.maps.MapMouseEvent) => {
            const latlng = event.latLng;
            if (!latlng) return;

            setPickedLocation(latlng);

            // Remove or move previous marker
            if (markerRef.current) {
              markerRef.current.setPosition(latlng);
            } else {
              markerRef.current = new window.google.maps.Marker({
                position: latlng,
                map: mapInstance.current,
                draggable: true,
                title: "Drag to adjust location",
              });

              // Add dragend listener to new marker
              if (!dragendListenerRef.current) {
                dragendListenerRef.current = google.maps.event.addListener(
                  markerRef.current,
                  "dragend",
                  (dragEvent: google.maps.MapMouseEvent) => {
                    const dragLatlng = dragEvent.latLng;
                    if (!dragLatlng) return;
                    setPickedLocation(dragLatlng);

                    geocoderRef.current?.geocode(
                      { location: dragLatlng },
                      (results, status) => {
                        if (
                          status === window.google.maps.GeocoderStatus.OK &&
                          results &&
                          results[0]
                        ) {
                          setNewAddress(results[0].formatted_address || "");
                        } else {
                          const lat = dragLatlng.lat().toFixed(6);
                          const lng = dragLatlng.lng().toFixed(6);
                          setNewAddress(`${lat}, ${lng}`);
                        }
                      }
                    );
                  }
                );
              }
            }

            // Reverse geocode for click position
            geocoderRef.current?.geocode(
              { location: latlng },
              (results, status) => {
                if (
                  status === window.google.maps.GeocoderStatus.OK &&
                  results &&
                  results[0]
                ) {
                  setNewAddress(results[0].formatted_address || "");
                } else {
                  const lat = latlng.lat().toFixed(6);
                  const lng = latlng.lng().toFixed(6);
                  setNewAddress(`${lat}, ${lng}`);
                }
              }
            );
          }
        );
      }

      return () => {
        if (clickListenerRef.current) {
          google.maps.event.removeListener(clickListenerRef.current);
          clickListenerRef.current = null;
        }
        if (dragendListenerRef.current) {
          google.maps.event.removeListener(dragendListenerRef.current);
          dragendListenerRef.current = null;
        }
        if (markerRef.current) {
          markerRef.current.setMap(null);
          markerRef.current = null;
        }
        if (currentMarkerRef.current) {
          currentMarkerRef.current.setMap(null);
          currentMarkerRef.current = null;
        }
        if (mapInstance.current) {
          google.maps.event.clearInstanceListeners(mapInstance.current);
          mapInstance.current = null;
        }
      };
    }
  }, [showAddForm, addressMode, mapLoaded, userLocation, pickedLocation]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const userData = await account.get();
      const { databaseId, userCollectionId } = validateEnv();
      let fullAddress = newAddress.trim();
      if (apartmentFlat.trim()) {
        fullAddress = `${apartmentFlat.trim()}, ${fullAddress}`;
      }
      const updatedAddresses = [...addresses, fullAddress];
      await databases.updateDocument(
        databaseId,
        userCollectionId,
        userData.$id,
        {
          address: updatedAddresses,
        }
      );
      setAddresses(updatedAddresses);
      setNewAddress("");
      setApartmentFlat("");
      setShowAddForm(false);
      setAddressMode("search");
      setPickedLocation(null);
      toast.success("Address added successfully!");
    } catch (err) {
      setError("Failed to add address.");
      toast.error("Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (idx: number) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await account.get();
      const { databaseId, userCollectionId } = validateEnv();
      const updatedAddresses = addresses.filter((_, i) => i !== idx);
      await databases.updateDocument(
        databaseId,
        userCollectionId,
        userData.$id,
        {
          address: updatedAddresses,
        }
      );
      setAddresses(updatedAddresses);
      toast.success("Address deleted successfully!");
      setDeleteConfirm(null);
    } catch (err) {
      setError("Failed to delete address.");
      toast.error("Failed to delete address");
    } finally {
      setLoading(false);
    }
  };

  const modeButtons = [
    { key: "search", label: "Search", mode: "search" as const },
    { key: "map", label: "Map", mode: "map" as const },
    { key: "manual", label: "Manual", mode: "manual" as const },
  ];

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-orange-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="relative w-20 h-20 mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full border-4 border-orange-200 dark:border-orange-800 border-t-orange-500"
            />
          </div>
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Loading addresses...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
            My Addresses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your delivery addresses for faster checkout
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Saved Addresses
            </h2>
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-semibold">
              {addresses.length}
            </span>
          </div>
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Address</span>
          </Button>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => {
                setShowAddForm(false);
                setAddressMode("search");
                setNewAddress("");
                setApartmentFlat("");
                setPickedLocation(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Add New Address
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setAddressMode("search");
                      setNewAddress("");
                      setApartmentFlat("");
                      setPickedLocation(null);
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    type="button"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <form onSubmit={handleAddAddress}>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {addressMode === "map"
                          ? "Pick your location on the map"
                          : addressMode === "manual"
                          ? "Enter address manually"
                          : "Search for your address or place"}
                      </label>
                      {addressMode === "search" && (
                        <input
                          ref={autocompleteInput}
                          type="text"
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          placeholder="Start typing your address or place..."
                          className="w-full rounded-xl px-4 py-3 text-base border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-all"
                        />
                      )}
                      {addressMode === "manual" && (
                        <Input
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          placeholder="Enter full address manually"
                          className="w-full rounded-xl px-4 py-3 text-base border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 bg-gray-50 dark:bg-gray-900"
                        />
                      )}
                      {addressMode === "map" && (
                        <div className="relative">
                          <div
                            ref={mapRef}
                            className="w-full h-64 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-200"
                          />
                          {newAddress && (
                            <p className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                              Selected: {newAddress}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 pt-3">
                        {modeButtons.map(({ key, label, mode }) => (
                          <Button
                            key={key}
                            type="button"
                            variant={
                              addressMode === mode ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => {
                              setAddressMode(mode);
                              if (mode !== "map") {
                                setPickedLocation(null);
                              }
                            }}
                            className={`${
                              addressMode === mode
                                ? "bg-orange-500 text-white hover:bg-orange-600"
                                : ""
                            }`}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Apartment/Flat/Suite (Optional)
                      </label>
                      <Input
                        value={apartmentFlat}
                        onChange={(e) => setApartmentFlat(e.target.value)}
                        placeholder="e.g. Apt 2B, Suite 301, Flat 4"
                        className="w-full rounded-xl px-4 py-3 text-base border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 bg-gray-50 dark:bg-gray-900"
                      />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddForm(false);
                          setAddressMode("search");
                          setNewAddress("");
                          setApartmentFlat("");
                          setPickedLocation(null);
                        }}
                        className="w-full sm:flex-1 h-12 rounded-xl font-semibold border-2"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading || !newAddress.trim()}
                        className="w-full sm:flex-1 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Add Address
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {addresses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="rounded-2xl shadow-xl border-0 bg-white dark:bg-gray-800 overflow-hidden">
              <CardContent className="flex flex-col items-center justify-center py-16 sm:py-20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                  className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6"
                >
                  <MapPin className="w-12 h-12 text-orange-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No Addresses Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-md">
                  Add your first delivery address to make ordering faster and
                  easier
                </p>
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 h-12 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="w-5 h-5" /> Add Your First Address
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {addresses.map((address, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  layout
                >
                  <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                    <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-orange-500" />
                          </div>
                          <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                            Address {idx + 1}
                          </CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(idx)}
                          disabled={loading}
                          className="flex-shrink-0 h-9 w-9 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                        {address}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {deleteConfirm !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <Trash2 className="w-8 h-8 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Delete Address?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Are you sure you want to delete this address? This action
                      cannot be undone.
                    </p>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row gap-3 w-full pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteConfirm(null)}
                      className="w-full sm:flex-1 h-11 rounded-xl font-semibold"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteAddress(deleteConfirm)}
                      disabled={loading}
                      className="w-full sm:flex-1 h-11 rounded-xl font-semibold bg-red-500 hover:bg-red-600"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Address"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyAddresses;

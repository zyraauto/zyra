"use client";

import { useState, useCallback } from "react";

type Coords = { lat: number; lng: number };
type GPSStatus = "idle" | "loading" | "success" | "denied" | "unavailable";

export function useGPS() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<GPSStatus>("idle");

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      return;
    }

    setStatus("loading");

    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setCoords({ lat: latitude, lng: longitude });
        setStatus("success");
      },
      (err) => {
        setStatus(err.code === 1 ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
    );
  }, []);

  const watchLocation = useCallback((
    onUpdate: (coords: Coords) => void
  ): (() => void) => {
    if (!navigator.geolocation) return () => {};

    const id = navigator.geolocation.watchPosition(
      ({ coords: { latitude, longitude } }) => {
        const c = { lat: latitude, lng: longitude };
        setCoords(c);
        setStatus("success");
        onUpdate(c);
      },
      () => setStatus("unavailable"),
      { enableHighAccuracy: true, maximumAge: 30_000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return {
    coords,
    status,
    isLoading: status === "loading",
    hasLocation: status === "success",
    getLocation,
    watchLocation,
  };
}

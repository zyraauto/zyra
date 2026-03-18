"use client";

import { useEffect, useRef } from "react";
import { useGPS } from "@/hooks/useGPS";
import { Button } from "@/components/ui/button";
import { NavigationArrowIcon, SpinnerIcon } from "@phosphor-icons/react";
import type { Tables } from "@/types/database";

type Workshop = Tables<"workshops">;

type Props = {
  workshops:  Workshop[];
  selectedId?: string | null;
  onSelect?:  (workshop: Workshop) => void;
  height?:    string;
};

export function WorkshopMap({
  workshops,
  selectedId,
  onSelect,
  height = "400px",
}: Props) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import("leaflet").Map | null>(null);
  const markersRef  = useRef<import("leaflet").Marker[]>([]);

  const { coords, isLoading, getLocation } = useGPS();

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const container = mapRef.current;

    import("leaflet").then((L) => {
      // ✅ Fix: cast correcto para eliminar _getIconUrl
      const iconProto = L.Icon.Default.prototype as unknown as Record<string, unknown>;
      delete iconProto._getIconUrl;

      L.Icon.Default.mergeOptions({
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const defaultCenter: [number, number] =
        workshops[0]?.lat && workshops[0]?.lng
          ? [workshops[0].lat, workshops[0].lng]
          : [19.4326, -99.1332];

      const map = L.map(container, {
        center:      defaultCenter,
        zoom:        12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom:     19,
      }).addTo(map);

      mapInstance.current = map;

      workshops.forEach((w) => {
        if (!w.lat || !w.lng) return;

        const isSelected = w.id === selectedId;

        const icon = L.divIcon({
          className: "",
          html: `
            <div style="
              background: ${isSelected ? "#2563eb" : "#1e40af"};
              color: white;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              width: 32px; height: 32px;
              display: flex; align-items: center; justify-content: center;
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              <span style="transform: rotate(45deg); font-size: 14px;">🔧</span>
            </div>
          `,
          iconSize:   [32, 32],
          iconAnchor: [16, 32],
        });

        const marker = L.marker([w.lat, w.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 160px;">
              <p style="font-weight: 600; margin: 0 0 4px;">${w.name}</p>
              ${w.address ? `<p style="font-size: 12px; color: #666; margin: 0;">${w.address}</p>` : ""}
              ${w.rating  ? `<p style="font-size: 12px; margin: 4px 0 0;">⭐ ${w.rating}</p>`   : ""}
            </div>
          `);

        marker.on("click", () => onSelect?.(w));
        markersRef.current.push(marker);
      });
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
      markersRef.current  = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan to user location
  useEffect(() => {
    if (!coords || !mapInstance.current) return;

    const run = async () => {
      const L   = await import("leaflet");
      const map = mapInstance.current!;
      map.setView([coords.lat, coords.lng], 13);

      L.circleMarker([coords.lat, coords.lng], {
        radius:      8,
        fillColor:   "#2563eb",
        color:       "#fff",
        weight:      2,
        opacity:     1,
        fillOpacity: 0.9,
      })
        .addTo(map)
        .bindPopup("Your location");
    };

    run();
  }, [coords]);

  // Highlight selected workshop
  useEffect(() => {
    if (!selectedId || !mapInstance.current) return;

    const workshop = workshops.find((w) => w.id === selectedId);
    if (workshop?.lat && workshop?.lng) {
      mapInstance.current.setView([workshop.lat, workshop.lng], 14, {
        animate: true,
      });
    }
  }, [selectedId, workshops]);

  return (
    <div
      className="relative rounded-xl overflow-hidden border"
      style={{ height }}
    >
      <div ref={mapRef} className="w-full h-full" />

      <div className="absolute bottom-4 right-4 z-[1000]">
        <Button
          size="sm"
          variant="secondary"
          onClick={getLocation}
          disabled={isLoading}
          className="shadow-md"
        >
          {isLoading ? (
            <SpinnerIcon className="size-4 animate-spin" />
          ) : (
            <NavigationArrowIcon weight="fill" className="size-4" />
          )}
          {isLoading ? "Locating…" : "My location"}
        </Button>
      </div>
    </div>
  );
}
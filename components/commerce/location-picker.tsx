"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";

const defaultPosition = {
  latitude: 10.7769,
  longitude: 106.7009
};

export function LocationPicker() {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [position, setPosition] = useState(defaultPosition);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function mountMap() {
      const L = await import("leaflet");
      if (!active || !mapElement.current || mapRef.current) return;

      const map = L.map(mapElement.current, { zoomControl: true }).setView(
        [defaultPosition.latitude, defaultPosition.longitude],
        13
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
      }).addTo(map);

      const marker = L.marker([defaultPosition.latitude, defaultPosition.longitude], { draggable: true }).addTo(map);
      marker.on("dragend", () => {
        const next = marker.getLatLng();
        setPosition({ latitude: Number(next.lat.toFixed(6)), longitude: Number(next.lng.toFixed(6)) });
      });
      map.on("click", (event) => {
        const next = event.latlng;
        marker.setLatLng(next);
        setPosition({ latitude: Number(next.lat.toFixed(6)), longitude: Number(next.lng.toFixed(6)) });
      });

      mapRef.current = map;
      markerRef.current = marker;
    }

    void mountMap();

    return () => {
      active = false;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    markerRef.current?.setLatLng([position.latitude, position.longitude]);
    mapRef.current?.panTo([position.latitude, position.longitude], { animate: true });
  }, [position]);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage("Browser location is not available.");
      return;
    }

    setMessage("Finding your location...");
    navigator.geolocation.getCurrentPosition(
      (location) => {
        setPosition({
          latitude: Number(location.coords.latitude.toFixed(6)),
          longitude: Number(location.coords.longitude.toFixed(6))
        });
        setMessage("Location added.");
      },
      () => setMessage("Could not access your location.")
    );
  }

  return (
    <section className="location-picker" aria-label="Delivery location">
      <div className="location-picker-heading">
        <div>
          <h2>Delivery pin</h2>
          <p className="muted">Click the map or use your current location.</p>
        </div>
        <button type="button" onClick={useCurrentLocation}>
          Use my location
        </button>
      </div>
      <div className="location-map" ref={mapElement} />
      <div className="location-coordinates">
        <label>
          Latitude
          <input
            name="deliveryLatitude"
            step="0.000001"
            type="number"
            value={position.latitude}
            onChange={(event) => setPosition((current) => ({ ...current, latitude: Number(event.target.value) }))}
          />
        </label>
        <label>
          Longitude
          <input
            name="deliveryLongitude"
            step="0.000001"
            type="number"
            value={position.longitude}
            onChange={(event) => setPosition((current) => ({ ...current, longitude: Number(event.target.value) }))}
          />
        </label>
      </div>
      {message ? <p className="muted">{message}</p> : null}
    </section>
  );
}

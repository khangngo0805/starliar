"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import { geolocationErrorMessage, resolveMapProvider } from "@/lib/commerce/store-settings";

declare global {
  interface Window {
    google?: typeof google;
    initStarliarGoogleMap?: () => void;
  }
}

const defaultPosition = {
  latitude: 10.7769,
  longitude: 106.7009
};

function googleMapsKey() {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}

function loadGoogleMaps(apiKey: string) {
  if (window.google?.maps) return Promise.resolve(window.google);

  return new Promise<typeof google>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-starliar-google-map]");
    window.initStarliarGoogleMap = () => {
      if (window.google) resolve(window.google);
    };

    if (existing) return;

    const script = document.createElement("script");
    script.async = true;
    script.dataset.starliarGoogleMap = "true";
    script.onerror = () => reject(new Error("GOOGLE_MAPS_LOAD_FAILED"));
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=initStarliarGoogleMap`;
    document.head.append(script);
  });
}

export function LocationPicker() {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const leafletMarkerRef = useRef<Marker | null>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const googleMarkerRef = useRef<google.maps.Marker | null>(null);
  const provider = resolveMapProvider(googleMapsKey());
  const [position, setPosition] = useState(defaultPosition);
  const [mapOpen, setMapOpen] = useState(false);
  const [message, setMessage] = useState(
    provider === "google"
      ? "Google Maps is active for delivery pins."
      : "Using OpenStreetMap. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable Google Maps."
  );

  useEffect(() => {
    let active = true;

    async function mountMap() {
      if (!mapOpen) return;
      if (!mapElement.current) return;

      if (provider === "google") {
        const apiKey = googleMapsKey();
        if (!apiKey) return;
        try {
          const googleApi = await loadGoogleMaps(apiKey);
          if (!active || !mapElement.current || googleMapRef.current) return;

          const map = new googleApi.maps.Map(mapElement.current, {
            center: { lat: defaultPosition.latitude, lng: defaultPosition.longitude },
            clickableIcons: false,
            mapTypeControl: false,
            streetViewControl: false,
            zoom: 14
          });
          const marker = new googleApi.maps.Marker({
            draggable: true,
            map,
            position: { lat: defaultPosition.latitude, lng: defaultPosition.longitude }
          });
          marker.addListener("dragend", () => {
            const next = marker.getPosition();
            if (!next) return;
            setPosition({ latitude: Number(next.lat().toFixed(6)), longitude: Number(next.lng().toFixed(6)) });
          });
          map.addListener("click", (event: google.maps.MapMouseEvent) => {
            if (!event.latLng) return;
            marker.setPosition(event.latLng);
            setPosition({
              latitude: Number(event.latLng.lat().toFixed(6)),
              longitude: Number(event.latLng.lng().toFixed(6))
            });
          });
          googleMapRef.current = map;
          googleMarkerRef.current = marker;
        } catch {
          setMessage("Google Maps could not load. Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
        }
        return;
      }

      const L = await import("leaflet");
      if (!active || !mapElement.current || leafletMapRef.current) return;

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

      leafletMapRef.current = map;
      leafletMarkerRef.current = marker;
    }

    void mountMap();

    return () => {
      active = false;
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
      leafletMarkerRef.current = null;
      googleMapRef.current = null;
      googleMarkerRef.current = null;
    };
  }, [mapOpen, provider]);

  useEffect(() => {
    leafletMarkerRef.current?.setLatLng([position.latitude, position.longitude]);
    leafletMapRef.current?.panTo([position.latitude, position.longitude], { animate: true });
    googleMarkerRef.current?.setPosition({ lat: position.latitude, lng: position.longitude });
    googleMapRef.current?.panTo({ lat: position.latitude, lng: position.longitude });
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
      (error) => setMessage(`${geolocationErrorMessage(error.code)} You can still click the map to drop a pin.`),
      { enableHighAccuracy: true, timeout: 10000 }
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
      {mapOpen ? (
        <div className="location-map" ref={mapElement} data-provider={provider} />
      ) : (
        <button className="location-map-placeholder" type="button" onClick={() => setMapOpen(true)}>
          <span>Open map</span>
          <small>{provider === "google" ? "Google Maps" : "OpenStreetMap"} will load after this click.</small>
        </button>
      )}
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

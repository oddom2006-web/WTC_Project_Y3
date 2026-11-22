'use client';
// src/components/LiveTrackMap.tsx
// Free map (Leaflet + OpenStreetMap tiles, no API key) showing a driver's
// live position, pushed instantly over our own Reverb WebSocket server.
// Vanilla Leaflet (not react-leaflet) so this can safely stay a plain client
// component without extra SSR gymnastics — Leaflet itself is loaded
// dynamically inside useEffect since it touches `window`.
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { getEcho } from '@/lib/echo';
import { getOrderLocation, type LiveLocation } from '@/lib/firestore';

export function LiveTrackMap({ orderId }: { orderId: string }) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef    = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'waiting' | 'live'>('loading');

  useEffect(() => {
    let cancelled = false;
    let channelName = `order.${orderId}`;

    async function init() {
      const L = (await import('leaflet')).default;

      // Fix Leaflet's default marker icons, which break under Next.js bundling
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (cancelled || !mapDivRef.current) return;

      const map = L.map(mapDivRef.current).setView([11.5564, 104.9282], 12); // default: Phnom Penh
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;

      const place = (lat: number, lng: number) => {
        if (!markerRef.current) {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        } else {
          markerRef.current.setLatLng([lat, lng]);
        }
        map.setView([lat, lng], 15);
        setStatus('live');
      };

      // Initial position (in case the driver's last ping was before this page loaded)
      const initial = await getOrderLocation(orderId);
      if (cancelled) return;
      if (initial) {
        place(initial.lat, initial.lng);
      } else {
        setStatus('waiting');
      }

      // Live pushes over Reverb from here on
      const echo = getEcho();
      echo?.private(channelName).listen('.location.updated', (e: LiveLocation) => {
        place(e.lat, e.lng);
      });
    }

    init();

    return () => {
      cancelled = true;
      getEcho()?.leave(channelName);
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [orderId]);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mapDivRef} style={{ height: 320, borderRadius: 12, overflow: 'hidden' }} />
      {status !== 'live' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'rgba(0,0,0,0.35)', color: '#fff',
          borderRadius: 12, fontSize: 14, pointerEvents: 'none',
        }}>
          {status === 'loading' ? 'Loading map…' : 'Waiting for driver location…'}
        </div>
      )}
    </div>
  );
}

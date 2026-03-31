import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { Bus as BusType } from '../types';

interface MapViewProps {
  buses: BusType[];
  selectedBus: BusType | null;
  onBusSelect: (bus: BusType) => void;
  height?: string;
  routePoints?: [number, number][];
}

export function MapView({ buses, selectedBus, onBusSelect, height = '500px', routePoints }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const routeLayersRef = useRef<any[]>([]);
  const gpsWatchIdRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);
  const hasCenteredOnUserRef = useRef(false);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || isInitializedRef.current) return;

    const timeoutId = window.setTimeout(() => {
      if (!mapRef.current || isInitializedRef.current) return;

      import('leaflet').then((L) => {
        if (!mapRef.current || isInitializedRef.current) return;

        try {
          const defaultCenter: [number, number] = [14.5995, 120.9842];

          const map = L.map(mapRef.current).setView(defaultCenter, 13);
          mapInstanceRef.current = map;
          isInitializedRef.current = true;

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map);

          if (navigator.geolocation) {
            gpsWatchIdRef.current = navigator.geolocation.watchPosition(
              (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                const latlng: [number, number] = [latitude, longitude];

                if (!hasCenteredOnUserRef.current) {
                  map.setView(latlng, 15);
                  hasCenteredOnUserRef.current = true;
                }

                if (userMarkerRef.current) {
                  userMarkerRef.current.remove();
                }

                const pulseSize = isMobile ? 28 : 36;
                const dotSize = isMobile ? 10 : 14;

                const userIcon = L.divIcon({
                  html: `
                    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                      <div style="position: absolute; width: ${pulseSize * 1.8}px; height: ${pulseSize * 1.8}px; background: rgba(59,130,246,0.2); border-radius: 50%; animation: gpsPulse 2s ease-out infinite;"></div>
                      <div style="width: ${pulseSize}px; height: ${pulseSize}px; background: linear-gradient(135deg, #3b82f6, #2563eb); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(59,130,246,0.5); border: ${isMobile ? '2px' : '3px'} solid white; z-index: 1;">
                        <div style="width: ${dotSize}px; height: ${dotSize}px; background: white; border-radius: 50%;"></div>
                      </div>
                    </div>
                    <style>
                      @keyframes gpsPulse {
                        0% { transform: scale(0.5); opacity: 1; }
                        100% { transform: scale(1.5); opacity: 0; }
                      }
                    </style>
                  `,
                  className: '',
                  iconSize: [pulseSize, pulseSize],
                  iconAnchor: [pulseSize / 2, pulseSize / 2],
                });

                const userMarker = L.marker(latlng, { icon: userIcon }).addTo(map);

                userMarker.bindPopup(
                  `
                    <div style="font-family: system-ui; min-width: ${isMobile ? '110px' : '150px'};">
                      <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: ${isMobile ? '5px 7px' : '8px 10px'}; margin: ${isMobile ? '-6px -6px 5px -6px' : '-8px -8px 8px -8px'}; border-radius: 4px 4px 0 0;">
                        <div style="font-weight: 600; font-size: ${isMobile ? '10px' : '12px'};">Your Location</div>
                      </div>
                      <div style="padding: 0 4px; color: #6b7280; font-size: ${isMobile ? '8px' : '10px'};">
                        <div>Lat: ${latitude.toFixed(5)}</div>
                        <div>Lng: ${longitude.toFixed(5)}</div>
                        <div>Accuracy: ±${Math.round(accuracy)}m</div>
                      </div>
                    </div>
                  `,
                  { closeButton: false, maxWidth: isMobile ? 140 : 180 },
                );

                userMarkerRef.current = userMarker;
              },
              (error) => {
                console.warn('GPS error:', error.message);
              },
              {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000,
              },
            );
          }
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);

      if (gpsWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      routeLayersRef.current.forEach((layer) => layer.remove());
      routeLayersRef.current = [];

      if (!routePoints || routePoints.length < 2) return;

      const shadow = L.polyline(routePoints, {
        color: '#000000',
        weight: 10,
        opacity: 0.1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(mapInstanceRef.current);

      const backing = L.polyline(routePoints, {
        color: '#ffffff',
        weight: 8,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(mapInstanceRef.current);

      const main = L.polyline(routePoints, {
        color: '#6366f1',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(mapInstanceRef.current);

      const dashed = L.polyline(routePoints, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(mapInstanceRef.current);

      const markerSize = isMobile ? 24 : 32;
      const markerIconSize = isMobile ? 12 : 16;

      const startIcon = L.divIcon({
        html: `
          <div style="width: ${markerSize}px; height: ${markerSize}px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(16,185,129,0.4); border: ${isMobile ? '2px' : '3px'} solid white;">
            <svg width="${markerIconSize}" height="${markerIconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `,
        className: '',
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize],
      });

      const endIcon = L.divIcon({
        html: `
          <div style="width: ${markerSize}px; height: ${markerSize}px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(239,68,68,0.4); border: ${isMobile ? '2px' : '3px'} solid white;">
            <svg width="${markerIconSize}" height="${markerIconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `,
        className: '',
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize],
      });

      const startMarker = L.marker(routePoints[0], { icon: startIcon }).addTo(mapInstanceRef.current);
      startMarker.bindPopup('Start', { closeButton: false });

      const endMarker = L.marker(routePoints[routePoints.length - 1], { icon: endIcon }).addTo(mapInstanceRef.current);
      endMarker.bindPopup('Destination', { closeButton: false });

      routeLayersRef.current = [shadow, backing, main, dashed, startMarker, endMarker];

      const bounds = L.latLngBounds(routePoints);
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
    });
  }, [routePoints]);

  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      buses
        .filter((bus) => bus.status === 'active')
        .forEach((bus) => {
          const isSelected = selectedBus?.id === bus.id;
          const maxCapacity = bus.maxCapacity || 1;
          const occupancyPercent = (bus.currentPassengers / maxCapacity) * 100;
          const colorClass = occupancyPercent < 50 ? '#10b981' : occupancyPercent < 80 ? '#f59e0b' : '#ef4444';

          const busNormalSize = isMobile ? 28 : 36;
          const busSelectedSize = isMobile ? 34 : 44;
          const busIconSize = isMobile ? (isSelected ? 16 : 14) : isSelected ? 22 : 18;
          const gpsBadgeSize = isMobile ? 12 : 16;
          const gpsBadgeIconSize = isMobile ? 7 : 10;

          const busIcon = L.divIcon({
            html: `
              <div style="position: relative; cursor: pointer;">
                <div style="width: ${isSelected ? busSelectedSize : busNormalSize}px; height: ${isSelected ? busSelectedSize : busNormalSize}px; background: linear-gradient(135deg, ${isSelected ? '#6366f1, #3b82f6' : '#1f2937, #111827'}); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.4); border: ${isMobile ? '2px' : '3px'} solid white;">
                  <svg width="${busIconSize}" height="${busIconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M5 11a2 2 0 0 0-2 2v2h16v-2a2 2 0 0 0-2-2"></path>
                    <path d="M4 11V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"></path>
                    <circle cx="8" cy="18" r="2"></circle>
                    <circle cx="16" cy="18" r="2"></circle>
                  </svg>
                </div>
                <div style="position: absolute; top: -${isMobile ? '3px' : '4px'}; right: -${isMobile ? '3px' : '4px'}; width: ${gpsBadgeSize}px; height: ${gpsBadgeSize}px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: ${isMobile ? '1.5px' : '2px'} solid white;">
                  <svg width="${gpsBadgeIconSize}" height="${gpsBadgeIconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3"></path>
                  </svg>
                </div>
                ${
                  isSelected
                    ? `<div style="position: absolute; inset: -${isMobile ? '6px' : '8px'}; border-radius: 50%; background: rgba(99,102,241,0.3); animation: ping 1s cubic-bezier(0,0,0.2,1) infinite;"></div>`
                    : ''
                }
              </div>
              <style>@keyframes ping { 75%,100% { transform: scale(2); opacity: 0; } }</style>
            `,
            className: '',
            iconSize: [isSelected ? busSelectedSize : busNormalSize, isSelected ? busSelectedSize : busNormalSize],
            iconAnchor: [
              (isSelected ? busSelectedSize : busNormalSize) / 2,
              (isSelected ? busSelectedSize : busNormalSize) / 2,
            ],
          });

          const marker = L.marker([bus.location.lat, bus.location.lng], { icon: busIcon })
            .addTo(mapInstanceRef.current)
            .on('click', () => onBusSelect(bus));

          marker.bindPopup(
            `
              <div style="font-family: system-ui; min-width: ${isMobile ? '120px' : '160px'};">
                <div style="background: linear-gradient(135deg, #6366f1, #3b82f6); color: white; padding: ${isMobile ? '5px 7px' : '8px 10px'}; margin: ${isMobile ? '-6px -6px 5px -6px' : '-8px -8px 8px -8px'}; border-radius: 4px 4px 0 0;">
                  <div style="font-weight: 600; font-size: ${isMobile ? '10px' : '13px'}; margin-bottom: ${isMobile ? '1px' : '2px'};">${bus.plateNumber}</div>
                  <div style="font-size: ${isMobile ? '8px' : '10px'}; opacity: 0.9;">${bus.driver}</div>
                </div>
                <div style="padding: 0 ${isMobile ? '3px' : '4px'};">
                  <div style="margin-bottom: ${isMobile ? '4px' : '6px'};">
                    <div style="font-size: ${isMobile ? '8px' : '10px'}; color: #6b7280; margin-bottom: ${isMobile ? '1px' : '2px'};">Route</div>
                    <div style="font-size: ${isMobile ? '9px' : '11px'}; color: #111827;">${bus.route}</div>
                  </div>
                  <div style="margin-bottom: ${isMobile ? '4px' : '6px'};">
                    <div style="font-size: ${isMobile ? '8px' : '10px'}; color: #6b7280; margin-bottom: ${isMobile ? '1px' : '2px'};">Passengers</div>
                    <div style="font-size: ${isMobile ? '9px' : '11px'}; color: #111827; margin-bottom: ${isMobile ? '2px' : '3px'};">${bus.currentPassengers}/${maxCapacity}</div>
                    <div style="width: 100%; height: ${isMobile ? '4px' : '6px'}; background: #e5e7eb; border-radius: ${isMobile ? '2px' : '3px'}; overflow: hidden;">
                      <div style="width: ${Math.min(occupancyPercent, 100)}%; height: 100%; background: ${colorClass};"></div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: ${isMobile ? '3px' : '4px'}; color: #10b981; font-size: ${isMobile ? '7px' : '9px'};">
                    <span>● GPS Active</span>
                  </div>
                </div>
              </div>
            `,
            { maxWidth: isMobile ? 150 : 200 },
          );

          if (isSelected) marker.openPopup();
          markersRef.current.push(marker);
        });
    });
  }, [buses, selectedBus, onBusSelect]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        overflow: 'hidden',
        borderRadius: '0.5rem',
      }}
    >
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 shadow-lg z-10">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <span className="text-xs sm:text-sm font-medium">LIVE</span>
      </div>

      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white/95 backdrop-blur-xl rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-lg z-10">
        <div className="flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex-shrink-0" />
            <span className="text-gray-700 whitespace-nowrap">You</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0" />
            <span className="text-gray-700 whitespace-nowrap">Start</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full flex-shrink-0" />
            <span className="text-gray-700 whitespace-nowrap">Destination</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-indigo-600 rounded-full flex-shrink-0" />
            <span className="text-gray-700 whitespace-nowrap">Bus</span>
          </div>
        </div>
      </div>

      <style>{`
  .leaflet-container {
    z-index: 0 !important;
  }

  .leaflet-pane,
  .leaflet-top,
  .leaflet-bottom,
  .leaflet-control {
    z-index: 1 !important;
  }

  .leaflet-popup-content-wrapper {
    border-radius: 12px !important;
    padding: 0 !important;
  }

  .leaflet-popup-content {
    margin: 12px !important;
  }

  .leaflet-popup-tip {
    background: white !important;
  }

  .leaflet-control-zoom {
    margin: 8px !important;
  }

  .leaflet-control-zoom a {
    width: 36px !important;
    height: 36px !important;
    line-height: 36px !important;
    font-size: 20px !important;
  }

  @media (min-width: 640px) {
    .leaflet-control-zoom a {
      width: 30px !important;
      height: 30px !important;
      line-height: 30px !important;
      font-size: 18px !important;
    }
  }

  .leaflet-popup {
    margin-bottom: 12px !important;
  }
`}</style>
    </div>
  );
}

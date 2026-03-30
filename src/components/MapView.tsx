import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import { Bus as BusType } from '../types'

interface MapViewProps {
  buses: BusType[]
  selectedBus: BusType | null
  onBusSelect: (bus: BusType) => void
  height?: string
}

export function MapView({ buses, selectedBus, onBusSelect, height = '500px' }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const isInitializedRef = useRef(false)

  // Detect if mobile screen
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  // Initialize map only once
  useEffect(() => {
    // Only initialize if window is defined (client-side) and not already initialized
    if (typeof window === 'undefined' || !mapRef.current || isInitializedRef.current) return

    // Add a small delay to ensure the DOM element is fully ready
    const timeoutId = setTimeout(() => {
      if (!mapRef.current || isInitializedRef.current) return

      // Dynamically import Leaflet only on client side
      import('leaflet').then((L) => {
        if (!mapRef.current || isInitializedRef.current) return

        try {
          // Initialize map centered on the route
          const map = L.map(mapRef.current).setView([14.3294, 121.0129], 11)
          mapInstanceRef.current = map
          isInitializedRef.current = true

          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map)

          // Define route points
          const routePoints: [number, number][] = [
            [14.3294, 121.0129], // Dasmariñas
            [14.35, 121.02],
            [14.38, 121.03],
            [14.41, 121.04],
            [14.45, 121.05], // Alabang
          ]

          // Define intermediate stops with names
          const stops = [
            { position: [14.3294, 121.0129] as [number, number], name: 'Dasmariñas Terminal', type: 'start' },
            { position: [14.35, 121.02] as [number, number], name: 'Salawag', type: 'stop' },
            { position: [14.38, 121.03] as [number, number], name: 'Molino', type: 'stop' },
            { position: [14.41, 121.04] as [number, number], name: 'Zapote', type: 'stop' },
            { position: [14.45, 121.05] as [number, number], name: 'Alabang Terminal', type: 'end' },
          ]

          // Draw route base shadow (for depth effect)
          L.polyline(routePoints, {
            color: '#000000',
            weight: 10,
            opacity: 0.1,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map)

          // Draw route highlight line (background)
          L.polyline(routePoints, {
            color: '#ffffff',
            weight: 8,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map)

          // Draw main route line with gradient effect
          L.polyline(routePoints, {
            color: '#6366f1',
            weight: 5,
            opacity: 0.95,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map)

          // Draw animated dashed line on top
          const animatedLine = L.polyline(routePoints, {
            color: '#3b82f6',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10',
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map)

          // Add intermediate stop markers
          stops.forEach((stop, index) => {
            if (stop.type === 'stop') {
              // Intermediate stop marker - smaller on mobile
              const stopSize = isMobile ? 14 : 20
              const dotSize = isMobile ? 4 : 6

              const stopIcon = L.divIcon({
                html: `
                  <div style="position: relative;">
                    <div style="width: ${stopSize}px; height: ${stopSize}px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,0.3); border: ${isMobile ? '1.5px' : '2px'} solid white;">
                      <div style="width: ${dotSize}px; height: ${dotSize}px; background: white; border-radius: 50%;"></div>
                    </div>
                  </div>
                `,
                className: '',
                iconSize: [stopSize, stopSize],
                iconAnchor: [stopSize / 2, stopSize / 2],
              })

              const marker = L.marker(stop.position, { icon: stopIcon }).addTo(map)

              // Add popup for intermediate stops - much smaller on mobile
              marker.bindPopup(
                `
                <div style="font-family: system-ui; text-align: center; min-width: ${isMobile ? '70px' : '100px'};">
                  <div style="background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: ${isMobile ? '4px 6px' : '6px 8px'}; margin: ${isMobile ? '-6px -6px 3px -6px' : '-8px -8px 4px -8px'}; border-radius: 4px 4px 0 0;">
                    <div style="font-weight: 600; font-size: ${isMobile ? '9px' : '11px'};">${stop.name}</div>
                    <div style="font-size: ${isMobile ? '7px' : '9px'}; opacity: 0.9; margin-top: 1px;">Stop ${index}</div>
                  </div>
                  <div style="padding: 1px; color: #6b7280; font-size: ${isMobile ? '7px' : '9px'};">
                    ${isMobile ? '' : 'Intermediate Stop'}
                  </div>
                </div>
              `,
                {
                  closeButton: false,
                  maxWidth: isMobile ? 100 : 150,
                  className: 'custom-popup-mobile',
                },
              )
            }
          })

          // Add start marker (Dasmariñas) - smaller on mobile
          const startSize = isMobile ? 24 : 32
          const startIconSize = isMobile ? 12 : 16

          const startIcon = L.divIcon({
            html: `
              <div style="position: relative;">
                <div style="width: ${startSize}px; height: ${startSize}px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(16,185,129,0.4); border: ${isMobile ? '2px' : '3px'} solid white;">
                  <svg width="${startIconSize}" height="${startIconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
              </div>
            `,
            className: '',
            iconSize: [startSize, startSize],
            iconAnchor: [startSize / 2, startSize],
          })

          const startMarker = L.marker(routePoints[0], { icon: startIcon }).addTo(map)

          startMarker.bindPopup(
            `
            <div style="font-family: system-ui; min-width: ${isMobile ? '100px' : '140px'};">
              <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: ${isMobile ? '5px 7px' : '8px 10px'}; margin: ${isMobile ? '-6px -6px 5px -6px' : '-8px -8px 8px -8px'}; border-radius: 4px 4px 0 0;">
                <div style="font-weight: 600; font-size: ${isMobile ? '10px' : '12px'}; margin-bottom: ${isMobile ? '1px' : '2px'};">${isMobile ? 'Dasmariñas' : 'Dasmariñas Terminal'}</div>
                <div style="font-size: ${isMobile ? '8px' : '10px'}; opacity: 0.9;">Start</div>
              </div>
              ${
                isMobile
                  ? ''
                  : `
              <div style="padding: 0 4px; color: #6b7280; font-size: 10px;">
                <div style="margin-bottom: 4px;">First stop of the route</div>
                <div style="display: flex; align-items: center; gap: 4px; color: #10b981; font-size: 9px;">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  </svg>
                  <span>Origin</span>
                </div>
              </div>
              `
              }
            </div>
          `,
            { closeButton: false, maxWidth: isMobile ? 130 : 180 },
          )

          // Add end marker (Alabang) - smaller on mobile
          const endIcon = L.divIcon({
            html: `
              <div style="position: relative;">
                <div style="width: ${startSize}px; height: ${startSize}px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(239,68,68,0.4); border: ${isMobile ? '2px' : '3px'} solid white;">
                  <svg width="${startIconSize}" height="${startIconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
              </div>
            `,
            className: '',
            iconSize: [startSize, startSize],
            iconAnchor: [startSize / 2, startSize],
          })

          const endMarker = L.marker(routePoints[routePoints.length - 1], { icon: endIcon }).addTo(map)

          endMarker.bindPopup(
            `
            <div style="font-family: system-ui; min-width: ${isMobile ? '100px' : '140px'};">
              <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: ${isMobile ? '5px 7px' : '8px 10px'}; margin: ${isMobile ? '-6px -6px 5px -6px' : '-8px -8px 8px -8px'}; border-radius: 4px 4px 0 0;">
                <div style="font-weight: 600; font-size: ${isMobile ? '10px' : '12px'}; margin-bottom: ${isMobile ? '1px' : '2px'};">${isMobile ? 'Alabang' : 'Alabang Terminal'}</div>
                <div style="font-size: ${isMobile ? '8px' : '10px'}; opacity: 0.9;">End</div>
              </div>
              ${
                isMobile
                  ? ''
                  : `
              <div style="padding: 0 4px; color: #6b7280; font-size: 10px;">
                <div style="margin-bottom: 4px;">Last stop of the route</div>
                <div style="display: flex; align-items: center; gap: 4px; color: #ef4444; font-size: 9px;">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  </svg>
                  <span>Destination</span>
                </div>
              </div>
              `
              }
            </div>
          `,
            { closeButton: false, maxWidth: isMobile ? 130 : 180 },
          )
        } catch (error) {
          console.error('Error initializing map:', error)
        }
      })
    }, 100) // 100ms delay

    // Cleanup only when component unmounts
    return () => {
      clearTimeout(timeoutId)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        isInitializedRef.current = false
      }
    }
  }, []) // Empty dependency array - only run once

  // Update bus markers separately when bus data changes
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return

    import('leaflet').then((L) => {
      // Clear existing bus markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Add bus markers
      buses
        .filter((bus) => bus.status === 'active')
        .forEach((bus) => {
          const isSelected = selectedBus?.id === bus.id
          const occupancyPercent = (bus.currentPassengers / bus.maxCapacity) * 100
          const colorClass = occupancyPercent < 50 ? '#10b981' : occupancyPercent < 80 ? '#f59e0b' : '#ef4444'

          // Mobile sizes
          const busNormalSize = isMobile ? 28 : 36
          const busSelectedSize = isMobile ? 34 : 44
          const busIconSize = isMobile ? (isSelected ? 16 : 14) : isSelected ? 22 : 18
          const gpsBadgeSize = isMobile ? 12 : 16
          const gpsBadgeIconSize = isMobile ? 7 : 10

          const busIcon = L.divIcon({
            html: `
            <div style="position: relative; cursor: pointer;">
              <div style="width: ${isSelected ? busSelectedSize : busNormalSize}px; height: ${isSelected ? busSelectedSize : busNormalSize}px; background: linear-gradient(135deg, ${isSelected ? '#6366f1, #3b82f6' : '#1f2937, #111827'}); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.4); border: ${isMobile ? '2px' : '3px'} solid white; transition: all 0.3s;">
                <svg width="${busIconSize}" height="${busIconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M5 11a2 2 0 0 0-2 2v2h16v-2a2 2 0 0 0-2-2"></path>
                  <path d="M4 11V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6"></path>
                  <circle cx="8" cy="18" r="2"></circle>
                  <circle cx="16" cy="18" r="2"></circle>
                </svg>
              </div>
              <div style="position: absolute; top: -${isMobile ? '3px' : '4px'}; right: -${isMobile ? '3px' : '4px'}; width: ${gpsBadgeSize}px; height: ${gpsBadgeSize}px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: ${isMobile ? '1.5px' : '2px'} solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
                <svg width="${gpsBadgeIconSize}" height="${gpsBadgeIconSize}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                  <path d="M5 18v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6"></path>
                  <line x1="12" y1="2" x2="12" y2="7"></line>
                  <line x1="12" y1="2" x2="15" y2="5"></line>
                  <line x1="12" y1="2" x2="9" y2="5"></line>
                </svg>
              </div>
              ${
                isSelected
                  ? `
                <div style="position: absolute; inset: -${isMobile ? '6px' : '8px'}; border-radius: 50%; background: rgba(99, 102, 241, 0.3); animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              `
                  : ''
              }
            </div>
            <style>
              @keyframes ping {
                75%, 100% {
                  transform: scale(2);
                  opacity: 0;
                }
              }
            </style>
          `,
            className: '',
            iconSize: [isSelected ? busSelectedSize : busNormalSize, isSelected ? busSelectedSize : busNormalSize],
            iconAnchor: [
              (isSelected ? busSelectedSize : busNormalSize) / 2,
              (isSelected ? busSelectedSize : busNormalSize) / 2,
            ],
          })

          const marker = L.marker([bus.location.lat, bus.location.lng], { icon: busIcon })
            .addTo(mapInstanceRef.current)
            .on('click', () => onBusSelect(bus))

          // Add popup with bus info - Much smaller on mobile
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
                <div style="font-size: ${isMobile ? '9px' : '11px'}; color: #111827; margin-bottom: ${isMobile ? '2px' : '3px'};">${bus.currentPassengers}/${bus.maxCapacity}</div>
                <div style="width: 100%; height: ${isMobile ? '4px' : '6px'}; background: #e5e7eb; border-radius: ${isMobile ? '2px' : '3px'}; overflow: hidden;">
                  <div style="width: ${occupancyPercent}%; height: 100%; background: ${colorClass}; transition: width 0.3s;"></div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: ${isMobile ? '3px' : '4px'}; color: #10b981; font-size: ${isMobile ? '7px' : '9px'};">
                <svg width="${isMobile ? '8' : '10'}" height="${isMobile ? '8' : '10'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 18v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6"></path>
                  <line x1="12" y1="2" x2="12" y2="7"></line>
                  <line x1="12" y1="2" x2="15" y2="5"></line>
                  <line x1="12" y1="2" x2="9" y2="5"></line>
                </svg>
                <span>GPS Active</span>
              </div>
            </div>
          </div>
        `,
            {
              maxWidth: isMobile ? 150 : 200,
              className: 'custom-popup',
            },
          )

          if (isSelected) {
            marker.openPopup()
          }

          markersRef.current.push(marker)
        })
    })
  }, [buses, selectedBus, onBusSelect]) // Only update markers when these change

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }} />

      {/* Live indicator overlay */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2 shadow-lg z-[1000]">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        <span className="text-xs sm:text-sm font-medium">LIVE</span>
      </div>

      {/* Map Legend - Responsive */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white/95 backdrop-blur-xl rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-lg z-[1000]">
        <div className="flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm">
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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
        /* Mobile-friendly touch controls */
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
        /* Make popups more mobile friendly */
        .leaflet-popup {
          margin-bottom: 30px !important;
        }
        @media (max-width: 640px) {
          .leaflet-popup-content-wrapper {
            max-width: 280px !important;
          }
          .custom-popup-mobile .leaflet-popup-content {
            margin: 8px !important;
          }
        }
      `}</style>
    </div>
  )
}

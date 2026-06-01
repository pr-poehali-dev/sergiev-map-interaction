import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { advertisers, categoryEmoji, type Advertiser, type Category } from '@/data/advertisers';

interface MapViewProps {
  selectedCategory: Category | 'all';
  onSelectAdvertiser: (a: Advertiser) => void;
  selectedId: number | null;
  userLocation: [number, number] | null;
}

const categoryColors: Record<string, string> = {
  hotel: '#F59E0B',
  restaurant: '#EF4444',
  attraction: '#10B981',
  shop: '#8B5CF6',
  spa: '#EC4899',
  tour: '#3B82F6',
  cafe: '#D97706',
};

export default function MapView({ selectedCategory, onSelectAdvertiser, selectedId, userLocation }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [56.3050, 38.1315],
      zoom: 15,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();

    const filtered = selectedCategory === 'all'
      ? advertisers
      : advertisers.filter(a => a.category === selectedCategory);

    filtered.forEach(adv => {
      const color = categoryColors[adv.category] || '#C8762A';
      const emoji = categoryEmoji[adv.category];
      const isSelected = adv.id === selectedId;

      const icon = L.divIcon({
        html: `<div style="
          width:${isSelected ? 44 : 36}px;
          height:${isSelected ? 44 : 36}px;
          background:${color};
          border:3px solid white;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:${isSelected ? 20 : 16}px;
          box-shadow:0 3px 14px rgba(0,0,0,0.3);
          cursor:pointer;
          transition:all 0.2s;
          ${isSelected ? 'transform:scale(1.1);' : ''}
        ">${emoji}</div>`,
        className: '',
        iconSize: [isSelected ? 44 : 36, isSelected ? 44 : 36],
        iconAnchor: [isSelected ? 22 : 18, isSelected ? 22 : 18],
      });

      const marker = L.marker([adv.lat, adv.lng], { icon })
        .addTo(map)
        .on('click', () => onSelectAdvertiser(adv));

      markersRef.current.set(adv.id, marker);
    });
  }, [selectedCategory, selectedId, onSelectAdvertiser]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    const userIcon = L.divIcon({
      html: `<div style="
        width:20px; height:20px;
        background:#4A90B8;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 0 8px rgba(74,144,184,0.2);
      "></div>`,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker(userLocation, { icon: userIcon }).addTo(map);
    map.flyTo(userLocation, 16, { animate: true, duration: 1.5 });
  }, [userLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const adv = advertisers.find(a => a.id === selectedId);
    if (adv) {
      map.flyTo([adv.lat, adv.lng], 17, { animate: true, duration: 0.8 });
    }
  }, [selectedId]);

  return (
    <div ref={containerRef} className="w-full h-full" style={{ minHeight: 400 }} />
  );
}

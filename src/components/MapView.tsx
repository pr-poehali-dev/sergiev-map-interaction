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
      const isPremium = adv.isPremium === true;

      let iconHtml = '';

      if (isPremium) {
        // Премиум-маркер: пин с подписью, золотая рамка, звёздочка
        const size = isSelected ? 52 : 44;
        const shortName = adv.name.length > 18 ? adv.name.slice(0, 17) + '…' : adv.name;
        iconHtml = `
          <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
            <div style="
              width:${size}px;height:${size}px;
              background:${color};
              border:3px solid #FFD700;
              border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              font-size:${isSelected ? 24 : 20}px;
              box-shadow:0 4px 16px rgba(0,0,0,0.35), 0 0 0 2px rgba(255,215,0,0.4);
              position:relative;
              transition:all 0.2s;
              ${isSelected ? 'transform:scale(1.12);' : ''}
            ">
              ${emoji}
              <div style="
                position:absolute;top:-6px;right:-6px;
                width:16px;height:16px;
                background:#FFD700;
                border-radius:50%;
                display:flex;align-items:center;justify-content:center;
                font-size:9px;
                box-shadow:0 1px 4px rgba(0,0,0,0.3);
              ">⭐</div>
            </div>
            <div style="
              margin-top:4px;
              background:white;
              color:#2E1A0E;
              font-size:10px;
              font-weight:700;
              font-family:'Golos Text',sans-serif;
              padding:2px 7px;
              border-radius:20px;
              box-shadow:0 2px 8px rgba(0,0,0,0.18);
              border:1.5px solid #FFD700;
              white-space:nowrap;
              max-width:130px;
              overflow:hidden;
              text-overflow:ellipsis;
            ">${shortName}</div>
          </div>`;
      } else {
        // Обычная точка достопримечательности — скромный серый кружок
        const size = isSelected ? 34 : 28;
        iconHtml = `
          <div style="
            width:${size}px;height:${size}px;
            background:#9CA3AF;
            border:2.5px solid white;
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-size:${isSelected ? 16 : 13}px;
            box-shadow:0 2px 8px rgba(0,0,0,0.18);
            cursor:pointer;
            opacity:0.85;
          ">${emoji}</div>`;
      }

      const w = isPremium ? 150 : (isSelected ? 34 : 28);
      const h = isPremium ? 80 : (isSelected ? 34 : 28);

      const icon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [w, h],
        iconAnchor: isPremium ? [w / 2, isSelected ? 52 : 44] : [w / 2, h / 2],
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
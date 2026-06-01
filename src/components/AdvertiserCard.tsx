import Icon from '@/components/ui/icon';
import { categoryLabels, categoryEmoji, type Advertiser } from '@/data/advertisers';

interface Props {
  advertiser: Advertiser;
  onClick?: () => void;
  compact?: boolean;
  onRoute?: (a: Advertiser) => void;
}

const badgeClass: Record<string, string> = {
  hotel: 'badge-hotel',
  restaurant: 'badge-restaurant',
  attraction: 'badge-attraction',
  shop: 'badge-shop',
  spa: 'badge-spa',
  tour: 'badge-tour',
  cafe: 'badge-cafe',
};

export default function AdvertiserCard({ advertiser: a, onClick, compact, onRoute }: Props) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        className="place-card w-full text-left bg-white rounded-2xl p-4 border border-amber-100 shadow-sm hover:border-amber-300 transition-all"
      >
        <div className="flex items-start gap-3">
          {a.image ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-amber-100">
              <img src={a.image} alt={a.name} className="w-full h-full object-cover object-top" />
            </div>
          ) : (
            <span className="text-2xl">{categoryEmoji[a.category]}</span>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-[var(--deep-brown)] leading-tight truncate">{a.name}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{a.address}</p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1.5 font-medium ${badgeClass[a.category]}`}>
              {categoryLabels[a.category]}
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden animate-scale-in">
      {/* Фото макета */}
      {a.image && (
        <div className="w-full h-44 overflow-hidden relative">
          <img
            src={a.image}
            alt={a.name}
            className="w-full h-full object-cover object-top"
          />
          {a.isPremium && (
            <div className="absolute top-2 right-2 bg-[#FFD700] text-[#2E1A0E] text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
              ⭐ Партнёр
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-2 mb-3">
          {!a.image && <span className="text-3xl">{categoryEmoji[a.category]}</span>}
          <div className="flex-1">
            <h3 className="font-bold text-[var(--deep-brown)] text-lg leading-tight" style={{ fontFamily: 'Cormorant, serif' }}>
              {a.name}
            </h3>
            <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium mt-1 ${badgeClass[a.category]}`}>
              {categoryEmoji[a.category]} {categoryLabels[a.category]}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{a.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Icon name="MapPin" size={14} />
            <span>{a.address}</span>
          </div>
          {a.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon name="Phone" size={14} />
              <a href={`tel:${a.phone}`} className="hover:text-[var(--warm-gold)] transition-colors">{a.phone}</a>
            </div>
          )}
          {a.workingHours && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon name="Clock" size={14} />
              <span>{a.workingHours}</span>
            </div>
          )}
          {a.website && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Icon name="Globe" size={14} />
              <a href={a.website} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--warm-gold)] transition-colors truncate">
                {a.website.replace('https://', '').replace('http://', '')}
              </a>
            </div>
          )}
        </div>

        {a.tags && a.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {a.tags.map(tag => (
              <span key={tag} className="text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-100">
                {tag}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => onRoute?.(a)}
          className="w-full flex items-center justify-center gap-2 bg-[var(--warm-gold)] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-amber-600 transition-colors"
        >
          <Icon name="Navigation" size={14} />
          Маршрут сюда
        </button>
      </div>
    </div>
  );
}

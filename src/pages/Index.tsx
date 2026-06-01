import { useState, useCallback, lazy, Suspense } from 'react';
import Icon from '@/components/ui/icon';
import AdvertiserCard from '@/components/AdvertiserCard';
import { advertisers, categoryLabels, categoryEmoji, routes, type Category, type Advertiser } from '@/data/advertisers';

const MapView = lazy(() => import('@/components/MapView'));

type Section = 'map' | 'catalog' | 'routes' | 'about';

const categories: { key: Category | 'all'; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'hotel', label: categoryLabels.hotel },
  { key: 'restaurant', label: categoryLabels.restaurant },
  { key: 'cafe', label: categoryLabels.cafe },
  { key: 'attraction', label: categoryLabels.attraction },
  { key: 'shop', label: categoryLabels.shop },
  { key: 'spa', label: categoryLabels.spa },
  { key: 'tour', label: categoryLabels.tour },
];

export default function Index() {
  const [section, setSection] = useState<Section>('map');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<Advertiser | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectAdvertiser = useCallback((a: Advertiser) => {
    setSelectedAdvertiser(a);
  }, []);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
        setSection('map');
      },
      () => setLocating(false),
      { enableHighAccuracy: true }
    );
  };

  const handleRoute = (a: Advertiser) => {
    const url = `https://yandex.ru/maps/?rtext=~${a.lat},${a.lng}&rtt=auto`;
    window.open(url, '_blank');
  };

  const filteredCatalog = advertisers.filter(a => {
    const matchCat = selectedCategory === 'all' || a.category === selectedCategory;
    const matchSearch = catalogSearch === '' || a.name.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const navItems: { key: Section; label: string; icon: string }[] = [
    { key: 'map', label: 'Карта', icon: 'Map' },
    { key: 'routes', label: 'Маршруты', icon: 'Route' },
    { key: 'catalog', label: 'Каталог', icon: 'LayoutGrid' },
    { key: 'about', label: 'О проекте', icon: 'Info' },
  ];

  return (
    <div className="min-h-screen bg-pattern flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--warm-gold)] flex items-center justify-center shadow-md">
              <span className="text-lg">⛪</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--deep-brown)] leading-none" style={{ fontFamily: 'Cormorant, serif' }}>
                Сергиев Посад
              </h1>
              <p className="text-[10px] text-amber-600 font-medium tracking-widest uppercase">Туристическая карта 2025</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`nav-item flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  section === item.key
                    ? 'text-[var(--warm-gold)] bg-amber-50 active'
                    : 'text-gray-600 hover:text-[var(--warm-gold)]'
                }`}
              >
                <Icon name={item.icon} size={15} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLocate}
              className="flex items-center gap-1.5 px-3 py-2 bg-[var(--forest-green)] text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
              {locating ? (
                <Icon name="Loader2" size={14} />
              ) : (
                <Icon name="LocateFixed" size={14} />
              )}
              <span className="hidden sm:inline">Я здесь</span>
            </button>

            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-amber-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={20} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-amber-100 bg-white px-4 pb-3 animate-fade-in">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => { setSection(item.key); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mt-1 transition-colors ${
                  section === item.key
                    ? 'text-[var(--warm-gold)] bg-amber-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4">

        {/* MAP */}
        {section === 'map' && (
          <div className="flex flex-col lg:flex-row gap-4 animate-fade-in">
            <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
              <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Категории</p>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        selectedCategory === cat.key
                          ? 'bg-[var(--warm-gold)] text-white shadow-sm'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      {cat.key !== 'all' && <span className="mr-1">{categoryEmoji[cat.key as Category]}</span>}
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedAdvertiser ? (
                <div className="relative">
                  <button
                    onClick={() => setSelectedAdvertiser(null)}
                    className="absolute -top-2 -right-2 z-10 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200 hover:bg-gray-50"
                  >
                    <Icon name="X" size={14} />
                  </button>
                  <AdvertiserCard advertiser={selectedAdvertiser} onRoute={handleRoute} />
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-amber-50">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      На карте ({selectedCategory === 'all' ? advertisers.length : advertisers.filter(a => a.category === selectedCategory).length})
                    </p>
                  </div>
                  <div className="p-2 space-y-1.5 max-h-72 overflow-y-auto">
                    {(selectedCategory === 'all' ? advertisers : advertisers.filter(a => a.category === selectedCategory)).map(a => (
                      <AdvertiserCard
                        key={a.id}
                        advertiser={a}
                        compact
                        onClick={() => setSelectedAdvertiser(a)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 rounded-2xl overflow-hidden shadow-lg border border-amber-100" style={{ height: 'calc(100vh - 140px)', minHeight: 400 }}>
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-amber-50">
                  <div className="text-center">
                    <Icon name="Map" size={48} className="text-amber-200 mx-auto mb-3" />
                    <p className="text-amber-600 text-sm">Загружаем карту...</p>
                  </div>
                </div>
              }>
                <MapView
                  selectedCategory={selectedCategory}
                  onSelectAdvertiser={handleSelectAdvertiser}
                  selectedId={selectedAdvertiser?.id ?? null}
                  userLocation={userLocation}
                />
              </Suspense>
            </div>
          </div>
        )}

        {/* ROUTES */}
        {section === 'routes' && (
          <div className="animate-fade-in max-w-4xl mx-auto py-4">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-[var(--deep-brown)] mb-2" style={{ fontFamily: 'Cormorant, serif' }}>
                Готовые маршруты
              </h2>
              <p className="text-gray-500">Curated прогулки по лучшим местам города</p>
            </div>
            <div className="grid gap-5">
              {routes.map((route, i) => {
                const stops = route.stops.map(id => advertisers.find(a => a.id === id)).filter(Boolean) as Advertiser[];
                return (
                  <div
                    key={route.id}
                    className="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden place-card animate-fade-in"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div
                        className="w-full md:w-48 p-8 flex flex-col items-center justify-center"
                        style={{ background: `${route.color}18` }}
                      >
                        <span className="text-5xl mb-2">{route.emoji}</span>
                        <div className="flex gap-4 mt-3">
                          <div className="text-center">
                            <p className="text-xs text-gray-400 font-medium">Время</p>
                            <p className="text-sm font-bold" style={{ color: route.color }}>{route.duration}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400 font-medium">Путь</p>
                            <p className="text-sm font-bold" style={{ color: route.color }}>{route.distance}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 p-6">
                        <h3 className="text-2xl font-bold text-[var(--deep-brown)] mb-2" style={{ fontFamily: 'Cormorant, serif' }}>
                          {route.name}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4">{route.description}</p>
                        <div className="space-y-2 mb-5">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Остановки</p>
                          {stops.map((stop, idx) => (
                            <div key={stop.id} className="flex items-center gap-3">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ background: route.color }}
                              >
                                {idx + 1}
                              </div>
                              <button
                                onClick={() => { setSelectedAdvertiser(stop); setSection('map'); }}
                                className="text-sm text-gray-700 hover:text-[var(--warm-gold)] transition-colors text-left"
                              >
                                <span className="mr-1">{categoryEmoji[stop.category]}</span>
                                {stop.name}
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => { setSelectedAdvertiser(stops[0]); setSection('map'); }}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:shadow-md"
                          style={{ background: route.color }}
                        >
                          <Icon name="Map" size={14} />
                          Смотреть на карте
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CATALOG */}
        {section === 'catalog' && (
          <div className="animate-fade-in py-4">
            <div className="text-center mb-6">
              <h2 className="text-4xl font-bold text-[var(--deep-brown)] mb-2" style={{ fontFamily: 'Cormorant, serif' }}>
                Все рекламодатели
              </h2>
              <p className="text-gray-500">Лучшие места Сергиева Посада</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск по названию..."
                  value={catalogSearch}
                  onChange={e => setCatalogSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-amber-100 rounded-xl text-sm focus:outline-none focus:border-amber-300 bg-white"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory === cat.key
                        ? 'bg-[var(--warm-gold)] text-white'
                        : 'bg-white text-gray-600 border border-amber-100 hover:border-amber-300'
                    }`}
                  >
                    {cat.key !== 'all' && <span className="mr-1">{categoryEmoji[cat.key as Category]}</span>}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalog.map((a, i) => (
                <div key={a.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <AdvertiserCard
                    advertiser={a}
                    onRoute={handleRoute}
                    onClick={() => { setSelectedAdvertiser(a); setSection('map'); }}
                  />
                </div>
              ))}
            </div>
            {filteredCatalog.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <Icon name="SearchX" size={48} className="mx-auto mb-3 opacity-30" />
                <p>Ничего не найдено</p>
              </div>
            )}
          </div>
        )}

        {/* ABOUT */}
        {section === 'about' && (
          <div className="animate-fade-in max-w-3xl mx-auto py-8">
            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-3xl bg-[var(--warm-gold)] flex items-center justify-center mx-auto mb-5 shadow-xl">
                <span className="text-4xl">⛪</span>
              </div>
              <h2 className="text-5xl font-bold text-[var(--deep-brown)] mb-3" style={{ fontFamily: 'Cormorant, serif' }}>
                О проекте
              </h2>
              <p className="text-gray-500 text-lg">Туристическая карта Сергиева Посада 2025</p>
            </div>
            <div className="space-y-5">
              {[
                {
                  icon: 'Map',
                  title: 'Интерактивная карта',
                  text: 'На карте отмечены все проверенные рекламодатели — рестораны, гостиницы, магазины, достопримечательности и многое другое. Нажмите на любой маркер, чтобы узнать подробности.',
                },
                {
                  icon: 'Route',
                  title: 'Готовые маршруты',
                  text: 'Мы подготовили тематические прогулки по городу: духовный маршрут вокруг Лавры, гастрономическое путешествие и шопинг за сувенирами.',
                },
                {
                  icon: 'LocateFixed',
                  title: 'Навигация',
                  text: 'Кнопка «Я здесь» определит ваше местоположение и покажет его на карте. Из любой карточки можно проложить маршрут в Яндекс.Картах.',
                },
                {
                  icon: 'Newspaper',
                  title: 'Проект СергиевГрад',
                  text: 'Карта создана совместно с редакцией sergievgrad.ru — главного городского медиа Сергиева Посада. Все рекламодатели проверены и рекомендованы редакцией.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm flex gap-5 place-card animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Icon name={item.icon} size={22} className="text-[var(--warm-gold)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--deep-brown)] mb-1 text-lg" style={{ fontFamily: 'Cormorant, serif' }}>
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-6 bg-[var(--warm-gold)] rounded-3xl text-white text-center shadow-xl">
              <p className="text-xl font-bold mb-2" style={{ fontFamily: 'Cormorant, serif' }}>
                Хотите разместить свою организацию?
              </p>
              <p className="text-amber-100 text-sm mb-4">Свяжитесь с редакцией СергиевГрад</p>
              <a
                href="https://www.sergievgrad.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[var(--warm-gold)] px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-50 transition-colors"
              >
                <Icon name="ExternalLink" size={14} />
                Перейти на сайт
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-amber-100 px-2 py-2 flex justify-around z-40 shadow-lg">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => setSection(item.key)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
              section === item.key ? 'text-[var(--warm-gold)]' : 'text-gray-400'
            }`}
          >
            <Icon name={item.icon} size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="h-16 md:hidden" />
    </div>
  );
}

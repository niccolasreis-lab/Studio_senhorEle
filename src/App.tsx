import React, { lazy, Suspense, useState, useEffect } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Collection from './components/Collection';
import InstagramSection from './components/InstagramSection';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import FloatingContactWidget from './components/FloatingContactWidget';

const AdminModal = lazy(() => import('./components/AdminModal'));
const VehicleDetailModal = lazy(() => import('./components/VehicleDetailModal'));

function SurfaceFallback() {
  return <div role="status" className="fixed inset-0 z-50 grid place-items-center bg-background/90 text-secondary font-label-caps text-xs">Carregando…</div>;
}

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedVehicleDetail, setSelectedVehicleDetail] = useState<string | null>(null);
  const [isFilmGrainEnabled, setIsFilmGrainEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('studio_film_grain');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const hasOpenModal = isAdminOpen || selectedVehicleDetail !== null;
  const isAdminPage = window.location.pathname.replace(/\/$/, '') === '/admin';

  const handleToggleFilmGrain = () => {
    setIsFilmGrainEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('studio_film_grain', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || params.get('admin') === '1') {
      window.history.replaceState({}, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
      setIsAdminOpen(true);
    }

    const vehicleParam = params.get('v') || params.get('vehicle') || params.get('shareId');
    if (vehicleParam) {
      const cleanParam = vehicleParam.toLowerCase().trim();
      import('./components/VehicleDetailModal').then(({ VEHICLE_DETAILS }) => {
        const match = Object.entries(VEHICLE_DETAILS).find(
          ([id, details]) =>
            id.toLowerCase() === cleanParam ||
            details.shareId.toLowerCase() === cleanParam ||
            details.shareId.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanParam.replace(/[^a-z0-9]/g, '')
        );
        if (match) setSelectedVehicleDetail(match[0]);
      });
    }
  }, []);

  if (isAdminPage || isAdminOpen) {
    return (
      <LanguageProvider>
        <Suspense fallback={<SurfaceFallback />}>
          <AdminModal
            isOpen
            onClose={() => { window.location.href = '/'; }}
            onVehicleAdded={() => window.dispatchEvent(new Event('storage'))}
          />
        </Suspense>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <div className="relative">
        <div
          aria-hidden={hasOpenModal ? true : undefined}
          inert={hasOpenModal ? true : undefined}
        >
          <CustomCursor />
          {isFilmGrainEnabled && (
            <div className="fixed inset-0 vintage-overlay z-50 pointer-events-none transition-opacity duration-500"></div>
          )}
          <Navigation />
          <main>
            <Hero />
            <About />
            <Collection
              onOpenDetail={(vehicleId) => setSelectedVehicleDetail(vehicleId)}
            />
            <InstagramSection />
          </main>
          <Footer 
            isFilmGrainEnabled={isFilmGrainEnabled}
            onToggleFilmGrain={handleToggleFilmGrain}
          />
          <FloatingContactWidget />
        </div>

        <Suspense fallback={hasOpenModal ? <SurfaceFallback /> : null}>
          {isAdminOpen && <AdminModal
            isOpen
            onClose={() => setIsAdminOpen(false)}
            onVehicleAdded={() => window.dispatchEvent(new Event('storage'))}
          />}

          {selectedVehicleDetail && <VehicleDetailModal
            vehicleId={selectedVehicleDetail}
            onClose={() => setSelectedVehicleDetail(null)}
          />}
        </Suspense>
      </div>
    </LanguageProvider>
  );
}

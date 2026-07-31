import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Collection from './components/Collection';
import Footer from './components/Footer';
import InquireModal from './components/InquireModal';
import VehicleDetailModal, { VEHICLE_DETAILS } from './components/VehicleDetailModal';
import CustomCursor from './components/CustomCursor';
import FloatingContactWidget from './components/FloatingContactWidget';
import AdminModal from './components/AdminModal';

export default function App() {
  const [isInquireOpen, setIsInquireOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<string | undefined>(undefined);
  const [selectedVehicleDetail, setSelectedVehicleDetail] = useState<string | null>(null);
  const [isFilmGrainEnabled, setIsFilmGrainEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('studio_film_grain');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const hasOpenModal = isInquireOpen || isAdminOpen || selectedVehicleDetail !== null;

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
      setIsAdminOpen(true);
    }

    const vehicleParam = params.get('v') || params.get('vehicle') || params.get('shareId');
    if (vehicleParam) {
      const cleanParam = vehicleParam.toLowerCase().trim();
      const match = Object.entries(VEHICLE_DETAILS).find(
        ([id, details]) =>
          id.toLowerCase() === cleanParam ||
          details.shareId.toLowerCase() === cleanParam ||
          details.shareId.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanParam.replace(/[^a-z0-9]/g, '')
      );

      if (match) {
        setSelectedVehicleDetail(match[0]);
      }
    }
  }, []);

  const handleOpenInquire = (carName?: string) => {
    setSelectedCar(carName);
    setIsInquireOpen(true);
  };

  const handleCloseInquire = () => {
    setIsInquireOpen(false);
  };

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
          <Navigation onOpenInquire={() => handleOpenInquire()} />
          <main>
            <Hero />
            <About />
            <Collection
              onSelectCarForInquiry={(carName) => handleOpenInquire(carName)}
              onOpenDetail={(vehicleId) => setSelectedVehicleDetail(vehicleId)}
            />
          </main>
          <Footer 
            onOpenInquire={() => handleOpenInquire()} 
            isFilmGrainEnabled={isFilmGrainEnabled}
            onToggleFilmGrain={handleToggleFilmGrain}
          />
          <FloatingContactWidget onOpenInquire={() => handleOpenInquire()} />
        </div>
        
        <InquireModal 
          isOpen={isInquireOpen} 
          onClose={handleCloseInquire} 
          selectedCar={selectedCar} 
        />

        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          onVehicleAdded={() => {
            window.dispatchEvent(new Event('storage'));
          }}
        />

        <VehicleDetailModal
          vehicleId={selectedVehicleDetail}
          onClose={() => setSelectedVehicleDetail(null)}
          onInquire={(carTitle) => handleOpenInquire(carTitle)}
        />
      </div>
    </LanguageProvider>
  );
}

import { useState } from 'react';
import FleetCarousel from '@/components/FleetCarousel';
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline';
import { VEHICLES, buildOrbitalData, type VehicleKey } from '@/data/vehicles';

export default function App() {
  const [selected, setSelected] = useState<VehicleKey | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const handleSelect = (key: VehicleKey) => {
    setTransitioning(true);
    // brief flash/zoom beat before swapping views, so it reads as one
    // continuous camera move rather than an abrupt cut
    window.setTimeout(() => {
      setSelected(key);
      window.setTimeout(() => setTransitioning(false), 80);
    }, 320);
  };

  const handleClose = () => {
    setTransitioning(true);
    window.setTimeout(() => {
      setSelected(null);
      window.setTimeout(() => setTransitioning(false), 80);
    }, 280);
  };

  const vehicle = selected ? VEHICLES[selected] : null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-ink">
      {/* Flash transition layer */}
      <div
        className="fixed inset-0 z-[200] pointer-events-none transition-opacity duration-300"
        style={{
          backgroundColor: '#000514',
          opacity: transitioning ? 0.9 : 0,
        }}
      />

      {!selected && <FleetCarousel onSelect={handleSelect} />}

      {selected && vehicle && (
        <div className="absolute inset-0">
          <RadialOrbitalTimeline
            vehicle={vehicle}
            timelineData={buildOrbitalData(vehicle)}
            onClose={handleClose}
          />
        </div>
      )}
    </div>
  );
}

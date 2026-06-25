import { useState, useRef } from 'react';
import FleetCarousel from '@/components/FleetCarousel';
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline';
import { VEHICLES, buildOrbitalData, type VehicleKey } from '@/data/vehicles';
import { VEHICLE_SVGS } from '@/components/vehicles/VehicleSvgs';
import { useLiveVehicleData, isLiveDataConfigured } from '@/data/liveData';

type Phase = 'carousel' | 'zooming-in' | 'orbital' | 'zooming-out';

const TRANSITION_MS = 620;

export default function App() {
  const [phase, setPhase] = useState<Phase>('carousel');
  const [selected, setSelected] = useState<VehicleKey | null>(null);
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const rafRef = useRef<number | null>(null);

  const vehicle = selected ? VEHICLES[selected] : null;
  const SvgComp = selected ? VEHICLE_SVGS[selected] : null;
  const isOrbitalActive = phase === 'orbital' || phase === 'zooming-out';
  const liveData = useLiveVehicleData(selected ?? 'bus', Boolean(selected) && isOrbitalActive);

  const handleSelect = (key: VehicleKey, rect: DOMRect) => {
    setSelected(key);
    setSourceRect(rect);
    setPhase('zooming-in');
    setAnimateIn(false);

    // double-rAF so the element mounts at its *start* position first, then
    // we flip the flag on the next frame to trigger the CSS transition to
    // its *end* position — this is the FLIP technique.
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => setAnimateIn(true));
    });

    window.setTimeout(() => setPhase('orbital'), TRANSITION_MS);
  };

  const handleClose = () => {
    setPhase('zooming-out');
    setAnimateIn(false);

    // same double-rAF FLIP trick as handleSelect: mount at the "expanded"
    // (center) position first, then flip to trigger the animated shrink
    // back down to the vehicle's spot in the carousel.
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => setAnimateIn(true));
    });

    window.setTimeout(() => {
      setSelected(null);
      setSourceRect(null);
      setPhase('carousel');
    }, TRANSITION_MS);
  };

  // Where the floating vehicle glyph should sit at each end of the animation.
  const viewportCenter = {
    width: Math.min(window.innerWidth * 0.34, 360),
    height: Math.min(window.innerWidth * 0.34, 360),
  };
  const centerTarget = sourceRect
    ? {
        left: window.innerWidth / 2 - viewportCenter.width / 2,
        top: window.innerHeight / 2 - viewportCenter.height / 2 - 40,
        width: viewportCenter.width,
        height: viewportCenter.height,
      }
    : null;

  const showFloatingVehicle = (phase === 'zooming-in' || phase === 'zooming-out') && sourceRect && centerTarget;

  // Both directions follow the same rule: render at `start` while animateIn
  // is false (the just-mounted frame), then animate to `end` once animateIn
  // flips true. Zoom-in goes carousel→center; zoom-out goes center→carousel.
  const start = phase === 'zooming-out' ? centerTarget : sourceRect;
  const end = phase === 'zooming-out' ? sourceRect : centerTarget;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-ink">
      <div
        className={phase === 'zooming-in' || phase === 'zooming-out' ? 'pointer-events-none' : ''}
      >
        {(phase === 'carousel' || phase === 'zooming-in' || phase === 'zooming-out') && (
          <FleetCarousel onSelect={handleSelect} />
        )}
      </div>

      {(phase === 'orbital' || phase === 'zooming-out') && vehicle && (
        <div
          className={`absolute inset-0 ${phase === 'zooming-out' ? 'pointer-events-none' : ''}`}
        >
          <RadialOrbitalTimeline
            vehicle={vehicle}
            timelineData={buildOrbitalData(vehicle, liveData)}
            onClose={handleClose}
            isLive={isLiveDataConfigured()}
          />
        </div>
      )}

      {/* Scrim that darkens whichever view is underneath during the zoom,
          so the transition reads as a camera push rather than a hard cut.
          Both phases now share the same animateIn direction (false→true on
          mount), and in both cases full darkness corresponds to the moment
          the glyph is over the *orbital/center* layout — i.e. animateIn
          true during zoom-in, animateIn false during zoom-out. */}
      {(phase === 'zooming-in' || phase === 'zooming-out') && (
        <div
          className="fixed inset-0 z-[150] pointer-events-none bg-[#03050d] transition-opacity"
          style={{
            opacity: phase === 'zooming-in' ? (animateIn ? 0.55 : 0) : animateIn ? 0 : 0.55,
            transitionDuration: `${TRANSITION_MS}ms`,
          }}
        />
      )}

      {/* The shared-element vehicle glyph — the one visual element common to
          both the carousel and the orbital view. It starts exactly where the
          clicked vehicle sat in the carousel, then scales/translates to the
          orbital ring's centre (and reverses on close). */}
      {showFloatingVehicle && SvgComp && vehicle && start && end && (
        <div
          className="fixed z-[160] pointer-events-none"
          style={{
            left: animateIn ? end.left : start.left,
            top: animateIn ? end.top : start.top,
            width: animateIn ? end.width : start.width,
            height: animateIn ? end.height : start.height,
            transition: `left ${TRANSITION_MS}ms cubic-bezier(0.65,0,0.35,1), top ${TRANSITION_MS}ms cubic-bezier(0.65,0,0.35,1), width ${TRANSITION_MS}ms cubic-bezier(0.65,0,0.35,1), height ${TRANSITION_MS}ms cubic-bezier(0.65,0,0.35,1)`,
            filter: `drop-shadow(0 0 60px ${vehicle.accent}88)`,
          }}
        >
          <SvgComp color={vehicle.accent} className="w-full h-full" />
        </div>
      )}
    </div>
  );
}

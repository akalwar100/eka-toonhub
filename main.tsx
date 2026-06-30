import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { VEHICLES, VEHICLE_ORDER, type VehicleKey } from '@/data/vehicles';
import { VEHICLE_SVGS } from '@/components/vehicles/VehicleSvgs';

type Role = 'center' | 'left' | 'right' | 'back';

interface FleetCarouselProps {
  onSelect: (key: VehicleKey, rect: DOMRect) => void;
}

export default function FleetCarousel({ onSelect }: FleetCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );
  const centerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const navigate = (dir: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (dir === 'next' ? (prev + 1) % 4 : (prev + 3) % 4));
    setTimeout(() => setIsAnimating(false), 650);
  };

  const center = activeIndex;
  const left = (activeIndex + 3) % 4;
  const right = (activeIndex + 1) % 4;
  const back = (activeIndex + 2) % 4;

  const roleOf = (i: number): Role =>
    i === center ? 'center' : i === left ? 'left' : i === right ? 'right' : 'back';

  const activeVehicle = VEHICLES[VEHICLE_ORDER[activeIndex]];

  const roleStyle = (role: Role): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      aspectRatio: '0.9 / 1',
      transition:
        'transform 650ms cubic-bezier(0.4,0,0.2,1), filter 650ms cubic-bezier(0.4,0,0.2,1), opacity 650ms cubic-bezier(0.4,0,0.2,1), left 650ms cubic-bezier(0.4,0,0.2,1)',
      willChange: 'transform, filter, opacity',
    };
    switch (role) {
      case 'center':
        return {
          ...base,
          left: '50%',
          bottom: isMobile ? '22%' : '8%',
          height: isMobile ? '42%' : '58%',
          transform: `translateX(-50%) scale(${isMobile ? 1.1 : 1.35})`,
          filter: 'blur(0px)',
          opacity: 1,
          zIndex: 20,
        };
      case 'left':
        return {
          ...base,
          left: isMobile ? '18%' : '28%',
          bottom: isMobile ? '30%' : '14%',
          height: isMobile ? '20%' : '30%',
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(2px)',
          opacity: 0.8,
          zIndex: 10,
        };
      case 'right':
        return {
          ...base,
          left: isMobile ? '82%' : '72%',
          bottom: isMobile ? '30%' : '14%',
          height: isMobile ? '20%' : '30%',
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(2px)',
          opacity: 0.8,
          zIndex: 10,
        };
      case 'back':
      default:
        return {
          ...base,
          left: '50%',
          bottom: isMobile ? '30%' : '14%',
          height: isMobile ? '16%' : '24%',
          transform: 'translateX(-50%) scale(1)',
          filter: 'blur(4px)',
          opacity: 0.55,
          zIndex: 5,
        };
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden font-body"
      style={{
        backgroundColor: activeVehicle.bg,
        transition: 'background-color 650ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <div className="relative w-full" style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 50,
            opacity: 0.35,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Ghost text */}
        <div
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none"
          style={{ zIndex: 2, top: '14%' }}
        >
          <span
            className="font-display uppercase leading-none whitespace-nowrap"
            style={{
              fontSize: 'clamp(70px, 22vw, 320px)',
              fontWeight: 900,
              color: 'white',
              opacity: 0.07,
              letterSpacing: '-0.02em',
            }}
          >
            EV FLEET
          </span>
        </div>

        {/* Brand label */}
        <div
          className="absolute top-6 left-4 sm:left-8 text-xs font-semibold uppercase text-white"
          style={{ zIndex: 60, opacity: 0.9, letterSpacing: '0.18em' }}
        >
          EKA MOBILITY
        </div>

        <div
          className="absolute top-6 right-4 sm:right-8 text-[10px] sm:text-xs font-mono uppercase text-white"
          style={{ zIndex: 60, opacity: 0.55, letterSpacing: '0.1em' }}
        >
          Fleet Command · {String(activeIndex + 1).padStart(2, '0')}/04
        </div>

        {/* Carousel */}
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {VEHICLE_ORDER.map((key, i) => {
            const role = roleOf(i);
            const vehicle = VEHICLES[key];
            const SvgComp = VEHICLE_SVGS[key];
            const isCenter = role === 'center';
            return (
              <div
                key={key}
                ref={isCenter ? centerRef : undefined}
                style={roleStyle(role)}
                onClick={(e) => {
                  if (isCenter) {
                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                    onSelect(key, rect);
                  } else if (!isAnimating) {
                    setActiveIndex(i);
                  }
                }}
                className={isCenter ? 'cursor-pointer group' : 'cursor-pointer'}
              >
                <div
                  className="w-full h-full flex items-end justify-center"
                  style={{
                    filter: isCenter ? `drop-shadow(0 0 60px ${vehicle.accent}55)` : 'none',
                  }}
                >
                  <SvgComp
                    color={isCenter ? vehicle.accent : '#ffffff'}
                    className="w-full h-full"
                  />
                </div>
                {isCenter && (
                  <div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-white/0 group-hover:text-white/70 transition-opacity duration-200 whitespace-nowrap"
                    style={{ opacity: 0 }}
                  >
                    Click to inspect
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom-left text + nav */}
        <div
          className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24 text-white"
          style={{ zIndex: 60, maxWidth: 340 }}
        >
          <p
            className="font-bold uppercase tracking-widest mb-2 sm:mb-3 text-base sm:text-[22px]"
            style={{ opacity: 0.95, letterSpacing: '0.02em' }}
          >
            {activeVehicle.name}
          </p>
          <p
            className="hidden sm:block text-xs sm:text-sm mb-4 sm:mb-5"
            style={{ opacity: 0.85, lineHeight: 1.6 }}
          >
            {activeVehicle.tagline} Tap the centre model to open its full operational dossier —
            specs, regional spread, highlights, issues, and training.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('prev')}
              aria-label="Previous vehicle"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white text-white flex items-center justify-center bg-transparent hover:scale-[1.08] hover:bg-white/10 transition-all duration-150"
            >
              <ArrowLeft size={26} strokeWidth={2.25} />
            </button>
            <button
              onClick={() => navigate('next')}
              aria-label="Next vehicle"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white text-white flex items-center justify-center bg-transparent hover:scale-[1.08] hover:bg-white/10 transition-all duration-150"
            >
              <ArrowRight size={26} strokeWidth={2.25} />
            </button>
          </div>
        </div>

        {/* Bottom-right link */}
        <a
          onClick={(e) => {
            e.preventDefault();
            const rect =
              centerRef.current?.getBoundingClientRect() ??
              new DOMRect(window.innerWidth / 2 - 1, window.innerHeight / 2 - 1, 2, 2);
            onSelect(VEHICLE_ORDER[activeIndex], rect);
          }}
          href="#"
          className="absolute bottom-6 right-4 sm:bottom-20 sm:right-10 flex items-center font-display text-white uppercase no-underline hover:opacity-100 transition-opacity duration-200"
          style={{
            zIndex: 60,
            fontSize: 'clamp(18px, 3.4vw, 48px)',
            fontWeight: 400,
            opacity: 0.95,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          Inspect
          <ArrowRight className="w-5 h-5 sm:w-8 sm:h-8 ml-2" strokeWidth={2.25} />
        </a>
      </div>
    </div>
  );
}

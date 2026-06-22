import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Link as LinkIcon, Zap, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OrbitalNode, VehicleConfig } from '@/data/vehicles';
import { NodeDetailBody } from './NodeDetailBody';

interface RadialOrbitalTimelineProps {
  vehicle: VehicleConfig;
  timelineData: OrbitalNode[];
  onClose: () => void;
}

export default function RadialOrbitalTimeline({
  vehicle,
  timelineData,
  onClose,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const accent = vehicle.accent;

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState: Record<number, boolean> = {};
      // close every other node — only one expanded at a time
      const willOpen = !prev[id];
      newState[id] = willOpen;

      if (willOpen) {
        setActiveNodeId(id);
        setAutoRotate(false);
        const relatedItems = getRelatedItems(id);
        const newPulse: Record<number, boolean> = {};
        relatedItems.forEach((relId) => (newPulse[relId] = true));
        setPulseEffect(newPulse);
        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer: ReturnType<typeof setInterval>;
    if (autoRotate) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => Number(((prev + 0.25) % 360).toFixed(3)));
      }, 50);
    }
    return () => {
      if (rotationTimer) clearInterval(rotationTimer);
    };
  }, [autoRotate]);

  const centerViewOnNode = (nodeId: number) => {
    if (!nodeRefs.current[nodeId]) return;
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;
    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 220;
    const radian = (angle * Math.PI) / 180;
    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian) * 0.55; // flatten vertically for widescreen feel
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));
    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    return getRelatedItems(activeNodeId).includes(itemId);
  };

  const getStatusStyles = (status: OrbitalNode['status']): string => {
    switch (status) {
      case 'completed':
        return 'text-black border-transparent';
      case 'in-progress':
        return 'text-black border-transparent';
      case 'pending':
        return 'text-white/70 bg-white/10 border-white/20';
      default:
        return 'text-white/70 bg-white/10 border-white/20';
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#070A12' }}
      ref={containerRef}
      onClick={handleContainerClick}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 sm:px-10 py-5 z-50">
        <div className="flex items-center gap-3">
          <span
            className="font-display text-base sm:text-xl uppercase tracking-tight"
            style={{ color: accent }}
          >
            {vehicle.name}
          </span>
          <span className="font-mono text-[10px] sm:text-xs text-white/40 uppercase tracking-widest">
            {vehicle.model}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs uppercase tracking-widest font-medium transition-colors"
        >
          Close <X size={14} />
        </button>
      </div>

      <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{ perspective: '1000px' }}
        >
          {/* Center pulse */}
          <div
            className="absolute w-16 h-16 rounded-full flex items-center justify-center z-10 animate-pulse-slow"
            style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
          >
            <div
              className="absolute w-20 h-20 rounded-full border animate-ping-slow opacity-70"
              style={{ borderColor: `${accent}55` }}
            />
            <div className="w-8 h-8 rounded-full bg-white/85 backdrop-blur-md" />
          </div>

          <div className="absolute w-[420px] h-[230px] rounded-full border border-white/10" />

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            const nodeStyle: React.CSSProperties = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (
              <div
                key={item.id}
                ref={(el) => {
                  nodeRefs.current[item.id] = el;
                }}
                className="absolute transition-all duration-700 cursor-pointer"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                <div
                  className={`absolute rounded-full -inset-1 ${isPulsing ? 'animate-pulse-slow' : ''}`}
                  style={{
                    background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }}
                />

                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                  style={{
                    backgroundColor: isExpanded ? accent : isRelated ? `${accent}40` : '#0E1422',
                    borderColor: isExpanded || isRelated ? accent : 'rgba(255,255,255,0.25)',
                    color: isExpanded ? '#070A12' : '#fff',
                    transform: isExpanded ? 'scale(1.4)' : 'scale(1)',
                    boxShadow: isExpanded ? `0 0 24px ${accent}66` : 'none',
                  }}
                >
                  <Icon size={17} />
                </div>

                <div
                  className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold tracking-wider transition-all duration-300 ${
                    isExpanded ? 'text-white scale-110' : 'text-white/65'
                  }`}
                  style={{ top: '52px' }}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <Card
                    className="absolute top-20 left-1/2 -translate-x-1/2 w-[300px] sm:w-[360px] bg-[#0A0F1C]/95 backdrop-blur-lg border-white/15 shadow-2xl overflow-visible"
                    style={{ boxShadow: `0 8px 40px ${accent}22, 0 0 0 1px rgba(255,255,255,0.06)` }}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/30" />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge
                          className={getStatusStyles(item.status)}
                          style={
                            item.status !== 'pending'
                              ? { backgroundColor: accent, color: '#070A12' }
                              : undefined
                          }
                        >
                          {item.status === 'completed'
                            ? 'COMPLETE'
                            : item.status === 'in-progress'
                              ? 'IN PROGRESS'
                              : 'PENDING'}
                        </Badge>
                        <span className="text-[10px] font-mono text-white/40">{item.date}</span>
                      </div>
                      <CardTitle className="text-sm mt-2 text-white font-body font-semibold">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-white/75 space-y-3">
                      <p>{item.content}</p>

                      <NodeDetailBody nodeId={item.id} detail={item.detail} accent={accent} />

                      <div className="pt-3 border-t border-white/10">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="flex items-center text-white/60">
                            <Zap size={10} className="mr-1" />
                            Priority Signal
                          </span>
                          <span className="font-mono text-white/70">{item.energy}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${item.energy}%`, backgroundColor: accent }}
                          />
                        </div>
                      </div>

                      {item.relatedIds.length > 0 && (
                        <div className="pt-3 border-t border-white/10">
                          <div className="flex items-center mb-2">
                            <LinkIcon size={10} className="text-white/50 mr-1" />
                            <h4 className="text-[10px] uppercase tracking-wider font-medium text-white/50">
                              Next in sequence
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find((i) => i.id === relatedId);
                              return (
                                <Button
                                  key={relatedId}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center h-6 px-2 py-0 text-xs rounded-none border-white/15 bg-transparent hover:bg-white/10 text-white/75 hover:text-white transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}
                                >
                                  {relatedItem?.title}
                                  <ArrowRight size={8} className="ml-1 text-white/50" />
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-5 left-0 right-0 text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/30 font-mono z-40">
        Tap a node to inspect &middot; tap empty space to release
      </div>
    </div>
  );
}

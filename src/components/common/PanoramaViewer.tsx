import { useState, useRef, useEffect } from 'react';
import { Compass, RotateCw, Maximize2, Move } from 'lucide-react';
import { DEFAULT_PANORAMA_TOUR } from '../../firebase/propertyService';

interface Props {
  imageUrl?: string;
  title?: string;
  className?: string;
}

export function PanoramaViewer({ imageUrl, title, className = '' }: Props) {
  const [isRotating, setIsRotating] = useState(true);
  const [posX, setPosX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const getValidUrl = (url?: string) => {
    if (url && typeof url === 'string' && url.trim().length > 0) {
      return url.trim();
    }
    return DEFAULT_PANORAMA_TOUR;
  };

  const [displayImage, setDisplayImage] = useState<string>(() => getValidUrl(imageUrl));

  useEffect(() => {
    setDisplayImage(getValidUrl(imageUrl));
  }, [imageUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX - posX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosX(e.clientX - startX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX - posX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setPosX(e.touches[0].clientX - startX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl overflow-hidden bg-gray-900 shadow-md group ${className}`}
    >
      {/* 360 Banner Badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
        <Compass className={`w-4 h-4 text-secondary-400 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
        <span>360° Virtual Home Tour</span>
      </div>

      {/* Control Tools */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          className={`p-2 rounded-full backdrop-blur-md text-white text-xs transition-colors border border-white/20 ${
            isRotating ? 'bg-secondary-500/80 text-white' : 'bg-black/50 hover:bg-black/70'
          }`}
          title="Toggle 360 Auto Rotation"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (containerRef.current?.requestFullscreen) {
              containerRef.current.requestFullscreen();
            }
          }}
          className="p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition-colors border border-white/20"
          title="Fullscreen 360 View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Panorama Drag Canvas Container */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-64 sm:h-80 cursor-grab active:cursor-grabbing overflow-hidden relative"
      >
        <div
          className={`w-[300%] h-full flex transition-transform duration-75 ${
            isRotating && !isDragging ? 'animate-panorama-scroll' : ''
          }`}
          style={{
            transform: `translateX(${posX % 1000}px)`,
          }}
        >
          <img
            src={displayImage}
            alt={title || '360 Home Tour'}
            onError={() => {
              if (displayImage !== DEFAULT_PANORAMA_TOUR) {
                setDisplayImage(DEFAULT_PANORAMA_TOUR);
              }
            }}
            className="w-full h-full object-cover select-none pointer-events-none"
          />
          <img
            src={displayImage}
            alt={title || '360 Home Tour'}
            onError={() => {
              if (displayImage !== DEFAULT_PANORAMA_TOUR) {
                setDisplayImage(DEFAULT_PANORAMA_TOUR);
              }
            }}
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        </div>

        {/* Drag Instruction Banner */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
          <Move className="w-3.5 h-3.5 text-secondary-400" />
          <span>Drag to look around 360°</span>
        </div>
      </div>
    </div>
  );
}

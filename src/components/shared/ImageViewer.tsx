import { X, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

/**
 * ImageViewer Props interface
 * @interface ImageViewerProps
 */
interface ImageViewerProps {
  /** The source URL of the image to display */
  src: string | null;
  /** Alt text for the image */
  alt?: string;
  /** Whether the viewer is open */
  isOpen: boolean;
  /** Function to call when closing the viewer */
  onClose: () => void;
}

/**
 * ImageViewer Component
 * 
 * A modal component that displays an image with zoom capabilities.
 * Supports zooming in, zooming out, and resetting the view.
 * 
 * @param {ImageViewerProps} props - The component props
 * @returns {JSX.Element | null} The rendered component or null if not open
 */
export function ImageViewer({ src, alt = 'Preview', isOpen, onClose }: ImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset state when opening a new image
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, src]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen || !src) return null;

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) { // Pinch to zoom on trackpad often maps to ctrl+wheel
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        setScale(prev => Math.min(Math.max(prev + delta, 0.5), 4));
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center overflow-hidden"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-[101] flex gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleZoomIn}
          className="bg-black/50 hover:bg-black/70 text-white rounded-full"
          title="Zoom In"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleZoomOut}
          className="bg-black/50 hover:bg-black/70 text-white rounded-full"
          title="Zoom Out"
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleReset}
          className="bg-black/50 hover:bg-black/70 text-white rounded-full"
          title="Reset View"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="bg-black/50 hover:bg-black/70 text-white rounded-full hover:text-red-400"
          title="Close"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Image Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4"
        onWheel={handleWheel}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain'
          }}
          draggable={false}
          className="select-none"
        />
      </div>
    </div>
  );
}


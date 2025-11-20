import React from 'react';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dumbbell' | 'default';
}

export function LoadingSpinner({
  className = '',
  size = 'md',
  variant = 'dumbbell'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  if (variant === 'dumbbell') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <style>{`
          @keyframes dumbbell-rotate {
            0% { transform: rotate(0deg) perspective(1000px) rotateY(0deg); }
            25% { transform: rotate(90deg) perspective(1000px) rotateY(25deg); }
            50% { transform: rotate(180deg) perspective(1000px) rotateY(0deg); }
            75% { transform: rotate(270deg) perspective(1000px) rotateY(-25deg); }
            100% { transform: rotate(360deg) perspective(1000px) rotateY(0deg); }
          }

          .dumbbell-container {
            animation: dumbbell-rotate 2s ease-in-out infinite;
            filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.5));
          }
        `}</style>

        <svg
          className={`dumbbell-container ${sizeClasses[size]}`}
          viewBox="0 0 120 60"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Left Weight Plate 1 */}
          <rect
            x="8"
            y="12"
            width="16"
            height="36"
            rx="2"
            fill="currentColor"
            className="text-emerald-500"
            opacity="0.9"
          />

          {/* Left Weight Plate 2 */}
          <rect
            x="26"
            y="6"
            width="14"
            height="48"
            rx="2"
            fill="currentColor"
            className="text-emerald-400"
            opacity="0.8"
          />

          {/* Left Collar */}
          <rect
            x="44"
            y="20"
            width="6"
            height="20"
            fill="currentColor"
            className="text-cyan-400"
            opacity="0.9"
          />

          {/* Center Bar - Main */}
          <rect
            x="50"
            y="24"
            width="20"
            height="12"
            rx="2"
            fill="currentColor"
            className="text-emerald-600"
          />

          {/* Right Collar */}
          <rect
            x="70"
            y="20"
            width="6"
            height="20"
            fill="currentColor"
            className="text-cyan-400"
            opacity="0.9"
          />

          {/* Right Weight Plate 2 */}
          <rect
            x="80"
            y="6"
            width="14"
            height="48"
            rx="2"
            fill="currentColor"
            className="text-emerald-400"
            opacity="0.8"
          />

          {/* Right Weight Plate 1 */}
          <rect
            x="98"
            y="12"
            width="16"
            height="36"
            rx="2"
            fill="currentColor"
            className="text-emerald-500"
            opacity="0.9"
          />

          {/* Highlight effect on center bar */}
          <rect
            x="50"
            y="24"
            width="20"
            height="4"
            rx="2"
            fill="currentColor"
            className="text-cyan-300"
            opacity="0.6"
          />
        </svg>
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>
      <div
        className={`spinner ${sizeClasses[size]} border-2 border-emerald-200 border-t-emerald-500 rounded-full`}
      />
    </div>
  );
}

// Export a combined component for loading states
export function LoadingOverlay({
  isLoading,
  variant = 'dumbbell',
  message = 'Loading...'
}: {
  isLoading: boolean;
  variant?: 'dumbbell' | 'default';
  message?: string;
}) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg p-8 flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" variant={variant} />
        {message && <p className="text-white text-sm">{message}</p>}
      </div>
    </div>
  );
}

import React from 'react';

export function MarigoldCornerMotif({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 150 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 144V30C6 16.7452 16.7452 6 30 6H144"
        stroke="var(--theme-gold, #D4AF37)"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      <path
        d="M14 144V34C14 22.9543 22.9543 14 34 14H144"
        stroke="var(--theme-gold, #D4AF37)"
        strokeWidth="0.9"
        strokeOpacity="0.5"
        strokeDasharray="3 3"
      />

      {/* Theme-Dynamic Botanical Leaves */}
      <path
        d="M28 54C16 58 12 72 22 76C30 70 32 60 28 54Z"
        fill="var(--theme-flower-leaf, #10B981)"
        fillOpacity="0.5"
      />
      <path
        d="M54 28C58 16 72 12 76 22C70 30 60 32 54 28Z"
        fill="var(--theme-flower-leaf, #10B981)"
        fillOpacity="0.5"
      />
      <path
        d="M46 46C56 50 64 62 56 68C48 64 44 54 46 46Z"
        fill="var(--theme-gold, #D4AF37)"
        fillOpacity="0.4"
      />

      {/* Theme-Dynamic Corner Flower Cluster */}
      <g transform="translate(34, 34)">
        <circle
          cx="0"
          cy="0"
          r="19"
          fill="var(--theme-flower-2, #E11D48)"
          fillOpacity="0.25"
        />
        <circle
          cx="0"
          cy="0"
          r="15"
          stroke="var(--theme-gold, #D4AF37)"
          strokeWidth="1.2"
          strokeOpacity="0.75"
        />
        <path
          d="M0 -16C4 -11 4 -6 0 -4C-4 -6 -4 -11 0 -16Z"
          fill="var(--theme-flower-1, #F59E0B)"
        />
        <path
          d="M0 16C4 11 4 6 0 4C-4 6 -4 11 0 16Z"
          fill="var(--theme-flower-1, #F59E0B)"
        />
        <path
          d="M-16 0C-11 -4 -6 -4 -4 0C-6 4 -11 4 -16 0Z"
          fill="var(--theme-flower-1, #F59E0B)"
        />
        <path
          d="M16 0C11 -4 6 -4 4 0C6 4 11 4 16 0Z"
          fill="var(--theme-flower-1, #F59E0B)"
        />
        <path
          d="M-11 -11C-7 -10 -4 -7 -4 -4C-7 -4 -10 -7 -11 -11Z"
          fill="var(--theme-flower-2, #E11D48)"
        />
        <path
          d="M11 -11C7 -10 4 -7 4 -4C7 -4 10 -7 11 -11Z"
          fill="var(--theme-flower-2, #E11D48)"
        />
        <path
          d="M-11 11C-7 10 -4 7 -4 4C-7 4 -10 7 -11 11Z"
          fill="var(--theme-flower-2, #E11D48)"
        />
        <path
          d="M11 11C7 10 4 7 4 4C7 4 10 7 11 11Z"
          fill="var(--theme-flower-2, #E11D48)"
        />
        <circle cx="0" cy="0" r="6" fill="var(--theme-flower-2, #E11D48)" />
        <circle cx="0" cy="0" r="2.5" fill="var(--theme-gold-light, #F3E5AB)" />
      </g>

      {/* Top & Left Trailing Floral Vines */}
      <g transform="translate(74, 16)">
        <circle cx="0" cy="0" r="7" fill="var(--theme-flower-1, #F59E0B)" />
        <circle cx="0" cy="0" r="3.5" fill="var(--theme-gold, #D4AF37)" />
        <circle cx="18" cy="-2" r="5" fill="var(--theme-flower-2, #E11D48)" />
        <circle cx="18" cy="-2" r="2" fill="var(--theme-gold-light, #F3E5AB)" />
        <circle cx="34" cy="0" r="4" fill="var(--theme-flower-1, #F59E0B)" />
        <circle cx="48" cy="-1" r="2.5" fill="#FBF7EE" />
      </g>

      <g transform="translate(16, 74)">
        <circle cx="0" cy="0" r="7" fill="var(--theme-flower-1, #F59E0B)" />
        <circle cx="0" cy="0" r="3.5" fill="var(--theme-gold, #D4AF37)" />
        <circle cx="-2" cy="18" r="5" fill="var(--theme-flower-2, #E11D48)" />
        <circle cx="-2" cy="18" r="2" fill="var(--theme-gold-light, #F3E5AB)" />
        <circle cx="0" cy="34" r="4" fill="var(--theme-flower-1, #F59E0B)" />
        <circle cx="-1" cy="48" r="2.5" fill="#FBF7EE" />
      </g>
    </svg>
  );
}

export function ClassicGoldCorner({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M4 146V30C4 15.6406 15.6406 4 30 4H146" stroke="var(--theme-gold, #D4AF37)" strokeWidth="2.5" />
      <path d="M12 146V38C12 23.6406 23.6406 12 38 12H146" stroke="var(--theme-gold, #D4AF37)" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="30" cy="30" r="6" fill="var(--theme-gold, #D4AF37)" />
      <circle cx="30" cy="30" r="3" fill="var(--theme-gold-light, #F3E5AB)" />
    </svg>
  );
}

export function LushFloralCorner({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="30" cy="30" r="25" fill="var(--theme-flower-2, #E11D48)" fillOpacity="0.2" />
      <path d="M30 60C15 60 5 45 5 30C5 15 15 5 30 5C45 5 55 15 55 30C55 45 45 60 30 60Z" fill="var(--theme-flower-1, #F59E0B)" fillOpacity="0.4" />
      <circle cx="30" cy="30" r="12" fill="var(--theme-flower-2, #E11D48)" />
      <circle cx="30" cy="30" r="5" fill="var(--theme-gold-light, #F3E5AB)" />
      <path d="M60 20C75 10 90 15 95 25" stroke="var(--theme-flower-leaf, #10B981)" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 60C10 75 15 90 25 95" stroke="var(--theme-flower-leaf, #10B981)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="85" cy="15" r="6" fill="var(--theme-flower-1, #F59E0B)" />
      <circle cx="15" cy="85" r="6" fill="var(--theme-flower-1, #F59E0B)" />
    </svg>
  );
}

export function ModernLeafCorner({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10 140C10 80 40 40 100 40" stroke="var(--theme-flower-leaf, #10B981)" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 100C40 40 80 10 140 10" stroke="var(--theme-flower-leaf, #10B981)" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="25" cy="70" rx="15" ry="8" transform="rotate(-45 25 70)" fill="var(--theme-flower-leaf, #10B981)" fillOpacity="0.6" />
      <ellipse cx="70" cy="25" rx="15" ry="8" transform="rotate(45 70 25)" fill="var(--theme-flower-leaf, #10B981)" fillOpacity="0.6" />
      <circle cx="45" cy="45" r="8" fill="var(--theme-flower-1, #F59E0B)" />
    </svg>
  );
}

export function FloralDivider({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 select-none ${className}`}
      aria-hidden="true"
    >
      <div className="h-px w-14 sm:w-24 bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
      <span
        className="w-2.5 h-2.5 rounded-full ring-2 ring-[#D4AF37]/40"
        style={{ backgroundColor: 'var(--theme-flower-1, #F59E0B)' }}
      />
      <svg className="w-7 h-7 text-[#D4AF37]" viewBox="0 0 32 32" fill="none">
        <path
          d="M16 2L19.5 11.5L29 15L19.5 18.5L16 28L12.5 18.5L3 15L12.5 11.5L16 2Z"
          stroke="currentColor"
          strokeWidth="1.3"
          fill="var(--theme-flower-1, #F59E0B)"
          fillOpacity="0.35"
        />
        <circle cx="16" cy="15" r="4" fill="var(--theme-flower-2, #E11D48)" />
        <circle cx="16" cy="15" r="1.5" fill="var(--theme-gold-light, #F3E5AB)" />
      </svg>
      <span
        className="w-2.5 h-2.5 rounded-full ring-2 ring-[#D4AF37]/40"
        style={{ backgroundColor: 'var(--theme-flower-1, #F59E0B)' }}
      />
      <div className="h-px w-14 sm:w-24 bg-gradient-to-l from-transparent via-[#D4AF37]/70 to-[#D4AF37]" />
    </div>
  );
}

export function MarigoldGarlandHeader() {
  return (
    <div
      className="w-full overflow-hidden pointer-events-none select-none opacity-95"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-9 sm:h-11"
        preserveAspectRatio="none"
      >
        {Array.from({ length: 12 }).map((_, idx) => {
          const x = idx * 100;
          return (
            <g key={idx} transform={`translate(${x}, 0)`}>
              <path
                d="M0 2 Q 50 42 100 2"
                stroke="var(--theme-gold, #D4AF37)"
                strokeWidth="1.4"
                strokeDasharray="4 3"
                fill="none"
              />
              <path
                d="M10 2 Q 50 28 90 2"
                stroke="var(--theme-flower-1, #F59E0B)"
                strokeWidth="1"
                strokeOpacity="0.65"
                fill="none"
              />
              <circle cx="18" cy="12" r="4.5" fill="var(--theme-flower-1, #F59E0B)" />
              <circle cx="34" cy="19" r="5" fill="var(--theme-flower-2, #E11D48)" />
              <circle cx="50" cy="22" r="6" fill="var(--theme-flower-1, #F59E0B)" />
              <circle cx="50" cy="22" r="2.5" fill="var(--theme-flower-2, #E11D48)" />
              <circle cx="66" cy="19" r="5" fill="var(--theme-flower-2, #E11D48)" />
              <circle cx="82" cy="12" r="4.5" fill="var(--theme-flower-1, #F59E0B)" />

              <line
                x1="100"
                y1="0"
                x2="100"
                y2="44"
                stroke="var(--theme-gold, #D4AF37)"
                strokeWidth="1.2"
              />
              <circle cx="100" cy="16" r="4.5" fill="var(--theme-flower-1, #F59E0B)" />
              <circle cx="100" cy="28" r="5" fill="var(--theme-flower-2, #E11D48)" />
              <circle cx="100" cy="39" r="4" fill="var(--theme-flower-1, #F59E0B)" />
              <circle cx="100" cy="47" r="2.5" fill="var(--theme-gold-light, #F3E5AB)" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function CardFloralArchBorder() {
  return (
    <div
      className="w-full flex items-center justify-center gap-2 py-1 select-none pointer-events-none"
      aria-hidden="true"
    >
      <div className="flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: 'var(--theme-flower-leaf, #10B981)' }}
        />
        <span
          className="w-3 h-3 rounded-full shadow-sm"
          style={{ backgroundColor: 'var(--theme-flower-1, #F59E0B)' }}
        />
        <span
          className="w-3.5 h-3.5 rounded-full ring-2 ring-[#D4AF37]/50"
          style={{ backgroundColor: 'var(--theme-flower-2, #E11D48)' }}
        />
        <span
          className="w-4 h-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--theme-flower-1, #F59E0B)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: 'var(--theme-flower-2, #E11D48)' }}
          />
        </span>
        <span className="w-2.5 h-2.5 rounded-full bg-[#F3E5AB]" />
        <span
          className="w-4 h-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--theme-flower-2, #E11D48)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
        </span>
        <span
          className="w-3.5 h-3.5 rounded-full ring-2 ring-[#D4AF37]/50"
          style={{ backgroundColor: 'var(--theme-flower-1, #F59E0B)' }}
        />
        <span
          className="w-3 h-3 rounded-full shadow-sm"
          style={{ backgroundColor: 'var(--theme-flower-2, #E11D48)' }}
        />
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: 'var(--theme-flower-leaf, #10B981)' }}
        />
      </div>
    </div>
  );
}



const FALLING_FLOWERS_CONFIG = [
  { id: 1, left: '3%', delay: '0s', duration: '10.5s', size: 24, type: 'marigold' },
  { id: 2, left: '9%', delay: '2.2s', duration: '12.5s', size: 20, type: 'rose' },
  { id: 3, left: '15%', delay: '4.5s', duration: '9.8s', size: 16, type: 'jasmine' },
  { id: 4, left: '21%', delay: '1.1s', duration: '13.5s', size: 25, type: 'rose' },
  { id: 5, left: '27%', delay: '3.4s', duration: '11.2s', size: 21, type: 'marigold' },
  { id: 6, left: '34%', delay: '0.5s', duration: '14s', size: 17, type: 'petal' },
  { id: 7, left: '41%', delay: '4.0s', duration: '11s', size: 23, type: 'marigold' },
  { id: 8, left: '48%', delay: '1.9s', duration: '13s', size: 20, type: 'rose' },
  { id: 9, left: '55%', delay: '5.8s', duration: '10s', size: 16, type: 'jasmine' },
  { id: 10, left: '62%', delay: '1.4s', duration: '12s', size: 24, type: 'marigold' },
  { id: 11, left: '69%', delay: '3.1s', duration: '14s', size: 19, type: 'rose' },
  { id: 12, left: '75%', delay: '5.1s', duration: '10.8s', size: 17, type: 'petal' },
  { id: 13, left: '82%', delay: '0.7s', duration: '12.6s', size: 22, type: 'marigold' },
  { id: 14, left: '89%', delay: '3.7s', duration: '11.5s', size: 20, type: 'rose' },
  { id: 15, left: '95%', delay: '2.5s', duration: '9.5s', size: 16, type: 'jasmine' },
];

export function FloralBackgroundAndFallingPetals({
  bgImageUrl,
  bgOpacity = 0.58,
  showFallingFlowers = true,
}: {
  bgImageUrl?: string;
  bgOpacity?: number;
  showFallingFlowers?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 no-print"
      aria-hidden="true"
    >
      {/* 1. Full-Viewport Photographic or Custom Uploaded Background Image */}
      {bgImageUrl && (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={bgImageUrl}
            alt=""
            referrerPolicy="no-referrer"
            style={{ opacity: bgOpacity }}
            className="w-full h-full object-cover object-center transition-opacity duration-500"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(0, 0, 0, 0.22) 0%, rgba(0, 0, 0, 0.56) 75%, rgba(0, 0, 0, 0.80) 100%)',
            }}
          />
        </div>
      )}

      {/* Repeating Royal Mughal Floral Damask Background Pattern removed as per request */}

      {/* 3. Theme-Dynamic Continuous Shower of Falling Flowers from the Top */}
      {showFallingFlowers &&
        FALLING_FLOWERS_CONFIG.map((item) => (
          <div
            key={item.id}
            className="absolute top-0 animate-flower-fall"
            style={{
              left: item.left,
              animationDelay: item.delay,
              animationDuration: item.duration,
              width: `${item.size}px`,
              height: `${item.size}px`,
            }}
          >
            {item.type === 'marigold' && (
              <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md">
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  fill="var(--theme-flower-1, #F59E0B)"
                  fillOpacity="0.95"
                />
                <path
                  d="M16 2 C19 8 19 12 16 14 C13 12 13 8 16 2 Z M16 30 C19 24 19 20 16 18 C13 20 13 24 16 30 Z M2 16 C8 13 12 13 14 16 C12 19 8 19 2 16 Z M30 16 C24 13 20 13 18 16 C20 19 24 19 30 16 Z"
                  fill="var(--theme-gold, #D97706)"
                />
                <circle cx="16" cy="16" r="5" fill="#FDE68A" />
                <circle cx="16" cy="16" r="2.5" fill="var(--theme-flower-2, #E11D48)" />
              </svg>
            )}

            {item.type === 'rose' && (
              <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md">
                <path
                  d="M16 3 C23 3 28 9 28 16 C28 23 22 29 16 29 C10 29 4 23 4 16 C4 9 9 3 16 3 Z"
                  fill="var(--theme-flower-2, #E11D48)"
                  fillOpacity="0.95"
                />
                <path
                  d="M16 7 C21 7 24 11 24 16 C24 21 20 24 16 24 C12 24 8 21 8 16 C8 11 11 7 16 7 Z"
                  fill="var(--theme-flower-1, #F59E0B)"
                  fillOpacity="0.45"
                />
                <circle cx="16" cy="16" r="4" fill="var(--theme-gold-light, #F3E5AB)" />
              </svg>
            )}

            {item.type === 'jasmine' && (
              <svg viewBox="0 0 28 28" className="w-full h-full drop-shadow">
                <path
                  d="M14 2 L17 10 L25 14 L17 18 L14 26 L11 18 L3 14 L11 10 Z"
                  fill="#FBF7EE"
                  fillOpacity="0.95"
                />
                <circle cx="14" cy="14" r="3.5" fill="var(--theme-gold, #D4AF37)" />
              </svg>
            )}

            {item.type === 'petal' && (
              <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow">
                <path
                  d="M12 2 C18 6 20 14 12 22 C4 14 6 6 12 2 Z"
                  fill="var(--theme-flower-2, #E11D48)"
                  fillOpacity="0.9"
                />
                <path
                  d="M12 5 C15 8 16 13 12 19"
                  stroke="#F3E5AB"
                  strokeWidth="1"
                  strokeOpacity="0.6"
                  fill="none"
                />
              </svg>
            )}
          </div>
        ))}
    </div>
  );
}

import React from 'react';

interface LogoProps {
  size?: number;         // tamaño del ícono en px
  showText?: boolean;    // mostrar o no el nombre al lado
  textColor?: string;    // color del texto "Conecta"
  accentColor?: string;  // color del texto "Mente"
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({
  size = 40,
  showText = true,
  textColor = '#1d5863',
  accentColor = '#4da6b0',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="conectamenteBadgeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1d5863" />
            <stop offset="1" stopColor="#2f7f8a" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="160" height="160" rx="40" fill="url(#conectamenteBadgeGrad)" />

        <g fill="#ffffff">
          <path
            d="M80 48
              C 56 48, 40 66, 40 88
              C 40 108, 53 122, 70 128
              C 70 128, 68 138, 62 142
              C 58 144, 60 148, 65 148
              L 95 148
              C 100 148, 102 144, 98 142
              C 92 138, 90 128, 90 128
              C 107 122, 120 108, 120 88
              C 120 66, 104 48, 80 48 Z"
          />
          <path
            d="M80 62
              C 88 58, 98 62, 100 72
              C 102 80, 96 86, 88 86
              C 92 78, 88 68, 80 66 Z"
            fill="#4da6b0"
          />
          <circle cx="62" cy="80" r="4" fill="#4da6b0" />
        </g>
      </svg>

      {showText && (
        <span style={{ fontSize: size * 0.5, fontWeight: 800, letterSpacing: '-0.5px' }}>
          <span style={{ color: textColor }}>Conecta</span>
          <span style={{ color: accentColor }}>Mente</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
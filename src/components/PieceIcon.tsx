import React from 'react';
import { PieceColor, PieceType } from '../types/chess';

interface PieceIconProps {
  type: PieceType;
  color: PieceColor;
  className?: string;
}

export const PieceIcon: React.FC<PieceIconProps> = ({
  type,
  color,
  className = 'w-full h-full',
}) => {
  const isWhite = color === 'white';

  // Universally recognized Staunton color scheme with crisp high-contrast stroke & fill
  const fill = isWhite ? '#FFFFFF' : '#222222';
  const stroke = isWhite ? '#18181B' : '#F4F4F5';
  const innerStroke = isWhite ? '#18181B' : '#F4F4F5';
  const strokeWidth = 1.5;

  return (
    <div className={`${className} flex items-center justify-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}>
      {renderPieceSvg(type, fill, stroke, innerStroke, strokeWidth)}
    </div>
  );
};

function renderPieceSvg(
  type: PieceType,
  fill: string,
  stroke: string,
  innerStroke: string,
  strokeWidth: number
) {
  switch (type) {
    case 'pawn':
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full">
          <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M 22.5 9 C 20.1 9 18.2 10.9 18.2 13.3 C 18.2 14.7 18.9 16 20 16.8 C 17.7 18.3 16.2 21 16.2 24 C 16.2 24.6 16.3 25.2 16.4 25.8 C 14.2 27.3 12.8 29.8 12.8 32.8 L 32.2 32.8 C 32.2 29.8 30.8 27.3 28.6 25.8 C 28.7 25.2 28.8 24.6 28.8 24 C 28.8 21 27.3 18.3 25 16.8 C 26.1 16 26.8 14.7 26.8 13.3 C 26.8 10.9 24.9 9 22.5 9 Z" />
            <path d="M 13 32.8 L 32 32.8 L 32 36 L 13 36 Z" />
            <path d="M 11.5 36 L 33.5 36 L 33.5 38.5 L 11.5 38.5 Z" />
          </g>
        </svg>
      );

    case 'knight':
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full">
          <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M 22,10 C 32.5,11 38.5,18 31,31 L 31,36 L 14,36 C 14,36 12,20 18,17 C 18,17 17,14 14,14 C 11,14 11,17 11,17 C 11,17 14,12 22,10 Z" />
            <circle cx="27" cy="18" r="1.5" fill={innerStroke} stroke="none" />
            <path d="M 24 23 C 21 23 18 21 18 21" stroke={innerStroke} strokeWidth="1.2" fill="none" />
            <path d="M 13 32.8 L 32 32.8 L 32 36 L 13 36 Z" />
            <path d="M 11.5 36 L 33.5 36 L 33.5 38.5 L 11.5 38.5 Z" />
          </g>
        </svg>
      );

    case 'bishop':
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full">
          <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="22.5" cy="8" r="2.2" />
            <path d="M 22.5,10.2 C 16.5,14.5 16.5,26.5 22.5,30.5 C 28.5,26.5 28.5,14.5 22.5,10.2 Z" />
            <line x1="17.5" y1="18" x2="27.5" y2="18" stroke={innerStroke} strokeWidth="1.5" />
            <line x1="22.5" y1="13" x2="22.5" y2="23" stroke={innerStroke} strokeWidth="1.5" />
            <path d="M 13 30.5 L 32 30.5 L 32 34.5 L 13 34.5 Z" />
            <path d="M 11.5 34.5 L 33.5 34.5 L 33.5 38 L 11.5 38 Z" />
          </g>
        </svg>
      );

    case 'rook':
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full">
          <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M 12,10 L 12,18 L 33,18 L 33,10 L 29,10 L 29,14 L 25,14 L 25,10 L 20,10 L 20,14 L 16,14 L 16,10 Z" />
            <path d="M 14,18 L 14,31 L 31,31 L 31,18 Z" />
            <path d="M 13 31 L 32 31 L 32 35 L 13 35 Z" />
            <path d="M 11.5 35 L 33.5 35 L 33.5 38.5 L 11.5 38.5 Z" />
          </g>
        </svg>
      );

    case 'queen':
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full">
          <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="12" r="2.2" />
            <circle cx="15.5" cy="9.5" r="2.2" />
            <circle cx="22.5" cy="8" r="2.2" />
            <circle cx="29.5" cy="9.5" r="2.2" />
            <circle cx="36" cy="12" r="2.2" />
            <path d="M 9,13 L 11,28 C 11,28 16,31 22.5,31 C 29,31 34,28 34,28 L 36,13 L 29.5,22 L 22.5,11 L 15.5,22 Z" />
            <path d="M 13 31 L 32 31 L 32 35 L 13 35 Z" />
            <path d="M 11.5 35 L 33.5 35 L 33.5 38.5 L 11.5 38.5 Z" />
          </g>
        </svg>
      );

    case 'king':
      return (
        <svg viewBox="0 0 45 45" className="w-full h-full">
          <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M 22.5,5 L 22.5,13" stroke={innerStroke} strokeWidth="2" />
            <path d="M 18.5,8.5 L 26.5,8.5" stroke={innerStroke} strokeWidth="2" />
            <path d="M 13.5,31 C 13.5,22 15.5,14 22.5,14 C 29.5,14 31.5,22 31.5,31 Z" />
            <path d="M 22.5,14 C 19.5,19 16.5,24 16.5,31" stroke={innerStroke} strokeWidth="1.2" fill="none" />
            <path d="M 22.5,14 C 25.5,19 28.5,24 28.5,31" stroke={innerStroke} strokeWidth="1.2" fill="none" />
            <path d="M 13 31 L 32 31 L 32 35 L 13 35 Z" />
            <path d="M 11.5 35 L 33.5 35 L 33.5 38.5 L 11.5 38.5 Z" />
          </g>
        </svg>
      );

    default:
      return null;
  }
}

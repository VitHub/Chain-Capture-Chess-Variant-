import React from 'react';
import { PieceColor, PieceType } from '../types/chess';

interface PieceIconProps {
  type: PieceType;
  color: PieceColor;
  className?: string;
}

export const PieceIcon: React.FC<PieceIconProps> = ({ type, color, className = 'w-full h-full' }) => {
  const isWhite = color === 'white';

  const fill = isWhite ? '#FFFFFF' : '#1E293B';
  const stroke = isWhite ? '#0F172A' : '#F8FAFC';
  const strokeWidth = 1.5;

  switch (type) {
    case 'pawn':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round">
            <path d="M 22.5,9 A 4,4 0 1,1 22.5,17 A 4,4 0 1,1 22.5,9 Z" />
            <path d="M 22.5,17 C 27,21 26,29 28,32 L 17,32 C 19,29 18,21 22.5,17 Z" />
            <path d="M 12,32 L 33,32 L 33,36 L 12,36 Z" />
          </g>
        </svg>
      );

    case 'knight':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round">
            <path d="M 22,10 C 32.5,11 38.5,18 31,31 L 31,32 L 14,32 C 14,32 12,20 18,17 C 18,17 17,14 14,14 C 11,14 11,17 11,17 C 11,17 14,12 22,10 Z" />
            <circle cx="27" cy="18" r="1.5" fill={isWhite ? '#0F172A' : '#FFFFFF'} />
            <path d="M 12,32 L 33,32 L 33,36 L 12,36 Z" />
          </g>
        </svg>
      );

    case 'bishop':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round">
            <circle cx="22.5" cy="8" r="2.5" />
            <path d="M 22.5,10.5 C 16,16 16,28 22.5,31 C 29,28 29,16 22.5,10.5 Z" />
            <line x1="18" y1="18" x2="27" y2="18" stroke={stroke} strokeWidth="1.5" />
            <line x1="22.5" y1="14" x2="22.5" y2="22" stroke={stroke} strokeWidth="1.5" />
            <path d="M 12,32 L 33,32 L 33,36 L 12,36 Z" />
          </g>
        </svg>
      );

    case 'rook':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round">
            <path d="M 12,32 L 33,32 L 33,36 L 12,36 Z" />
            <path d="M 14,32 L 14,18 L 31,18 L 31,32 Z" />
            <path d="M 12,18 L 12,10 L 16,10 L 16,13 L 20,13 L 20,10 L 25,10 L 25,13 L 29,13 L 29,10 L 33,10 L 33,18 Z" />
          </g>
        </svg>
      );

    case 'queen':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round">
            <path d="M 12,32 L 33,32 L 33,36 L 12,36 Z" />
            <path d="M 13,32 L 9,13 L 17,21 L 22.5,10 L 28,21 L 36,13 L 32,32 Z" />
            <circle cx="9" cy="11" r="2" />
            <circle cx="17" cy="19" r="2" />
            <circle cx="22.5" cy="8" r="2" />
            <circle cx="28" cy="19" r="2" />
            <circle cx="36" cy="11" r="2" />
          </g>
        </svg>
      );

    case 'king':
      return (
        <svg viewBox="0 0 45 45" className={className}>
          <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round">
            <path d="M 12,32 L 33,32 L 33,36 L 12,36 Z" />
            <path d="M 14,32 C 14,24 16,16 22.5,16 C 29,16 31,24 31,32 Z" />
            <line x1="22.5" y1="6" x2="22.5" y2="14" stroke={stroke} strokeWidth="2" />
            <line x1="18.5" y1="9" x2="26.5" y2="9" stroke={stroke} strokeWidth="2" />
          </g>
        </svg>
      );

    default:
      return null;
  }
};

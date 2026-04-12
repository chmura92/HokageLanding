interface HokageLogoProps {
  className?: string;
}

export default function HokageLogo({ className }: HokageLogoProps) {
  return (
    <svg
      viewBox="0 0 160 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Hokage logo"
    >
      {/* Hat - conical kasa shape */}
      <polygon
        points="25,2 6,22 44,22"
        fill="#FFF5E6"
        stroke="#E85D3A"
        strokeWidth="0.5"
      />
      {/* Hat brim - orange/red accent stripe */}
      <path
        d="M6,22 Q25,28 44,22 Q25,26 6,22Z"
        fill="#E85D3A"
      />
      {/* Brim underline */}
      <ellipse cx="25" cy="23" rx="20" ry="3" fill="#D14E2F" opacity="0.6" />
      {/* Fire kanji 火 on hat */}
      <text
        x="25"
        y="18"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#E85D3A"
        fontFamily="serif"
      >
        火
      </text>
      {/* HOKAGE text */}
      <text
        x="55"
        y="20"
        fontSize="16"
        fontWeight="800"
        fill="white"
        fontFamily="Inter, system-ui, sans-serif"
        letterSpacing="2"
      >
        HOKAGE
      </text>
    </svg>
  );
}

type DestinationFinderIconProps = {
  className?: string;
  size?: number;
  accent?: string;
  base?: string;
};

export default function DestinationFinderIcon({
  className = "",
  size = 64,
  accent = "#f2d9ad",
  base = "#132729",
}: DestinationFinderIconProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      role="img"
    >
      <circle cx="60" cy="60" r="46" fill="none" stroke={base} strokeWidth="4" opacity="0.95" />
      <circle cx="60" cy="60" r="34" fill="none" stroke={accent} strokeWidth="3" opacity="0.95" />
      <path d="M60 18v18" stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M60 84v18" stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M18 60h18" stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M84 60h18" stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M33 33l13 13" stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M74 74l13 13" stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M33 87l13-13" stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M74 46l13-13" stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M60 46l-8 14 8 14 8-14-8-14z" fill={accent} opacity="0.95" />
      <circle cx="60" cy="60" r="8" fill={base} />
    </svg>
  );
}

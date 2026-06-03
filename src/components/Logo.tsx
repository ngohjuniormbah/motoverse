export function Logo({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Motoverse">
      <rect width="64" height="64" rx="15" fill="#2563EB" />
      <path d="M32 8 L54 20 L54 44 L32 56 L10 44 L10 20 Z" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.5" />
      <path d="M18 44 L18 22 L24 22 L32 34 L40 22 L46 22 L46 44" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type BrandMarkProps = { className?: string };

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M17 6.5C17 4.6 15.2 4 12 4C8.6 4 7 5.4 7 7.6C7 12.2 17 11 17 15.8C17 18.4 15.4 20 12 20C8.8 20 7 19.4 7 17.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

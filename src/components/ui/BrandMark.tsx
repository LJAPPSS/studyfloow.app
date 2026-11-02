type BrandMarkProps = { className?: string };

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M2.5 7Q7 4.8 12 7.5Q17 4.8 21.5 7V18.5Q17 17 12 19.5Q7 17 2.5 18.5Z M12 7.5V19.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M19.5 1.5L20.3 3.2L22 4L20.3 4.8L19.5 6.5L18.7 4.8L17 4L18.7 3.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

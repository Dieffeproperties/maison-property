interface HairlineDividerProps {
  className?: string;
  vertical?: boolean;
}

export default function HairlineDivider({ className = '', vertical = false }: HairlineDividerProps) {
  if (vertical) {
    return <span className={`hairline-vertical inline-block h-full ${className}`} aria-hidden="true" />;
  }
  return <hr className={`hairline border-none my-0 ${className}`} aria-hidden="true" />;
}

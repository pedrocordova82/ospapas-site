import { SVGProps } from "react";

export function FamiliaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="9" cy="7" r="4" />
      <path d="M17 11a4 4 0 1 0-3-6" />
      <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
      <path d="M16 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  );
}

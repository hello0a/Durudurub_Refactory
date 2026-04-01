interface HappyIconProps {
  className?: string;
  color?: string;
}

export function HappyIcon({ className, color = "#00A651" }: HappyIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 얼굴 원 */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      
      {/* 왼쪽 눈 */}
      <circle cx="8.5" cy="9.5" r="1.5" fill={color} />
      
      {/* 오른쪽 눈 */}
      <circle cx="15.5" cy="9.5" r="1.5" fill={color} />
      
      {/* 웃는 입 */}
      <path
        d="M7 14C7 14 8.5 17 12 17C15.5 17 17 14 17 14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

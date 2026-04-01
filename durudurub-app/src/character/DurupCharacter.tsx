interface DurupCharacterProps {
  size?: number;
  variant?: 'happy' | 'wink' | 'simple' | 'excited' | 'love' | 'thinking' | 'icon' | 'sad' | 'surprised' | 'sorry';
  className?: string;
}

export function DurupCharacter({ 
  size = 100, 
  variant = 'happy',
  className = '' 
}: DurupCharacterProps) {
  
  // 슬퍼하는 표정 (404, 500 에러용)
  if (variant === 'sad') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* 두릅 몸통 - 메인 */}
        <ellipse cx="50" cy="60" rx="25" ry="32" fill="#00A651" />
        
        {/* 두릅 잎 - 왼쪽 (약간 처진) */}
        <ellipse cx="35" cy="36" rx="8" ry="18" fill="#00C962" transform="rotate(-30 35 36)" />
        
        {/* 두릅 잎 - 가운데 (약간 처진) */}
        <ellipse cx="50" cy="30" rx="9" ry="21" fill="#00C962" />
        
        {/* 두릅 잎 - 오른쪽 (약간 처진) */}
        <ellipse cx="65" cy="36" rx="8" ry="18" fill="#00C962" transform="rotate(30 65 36)" />
        
        {/* 얼굴 - 눈 왼쪽 (슬픈 눈) */}
        <circle cx="43" cy="58" r="3" fill="#FFFFFF" />
        <circle cx="43.5" cy="58.5" r="1.5" fill="#333333" />
        
        {/* 얼굴 - 눈 오른쪽 (슬픈 눈) */}
        <circle cx="57" cy="58" r="3" fill="#FFFFFF" />
        <circle cx="57.5" cy="58.5" r="1.5" fill="#333333" />
        
        {/* 눈물 왼쪽 */}
        <ellipse cx="42" cy="64" rx="1.5" ry="3" fill="#8DD5F7" opacity="0.8" />
        <circle cx="42" cy="68" r="1.5" fill="#8DD5F7" opacity="0.6" />
        
        {/* 얼굴 - 입 (슬픈 입) */}
        <path
          d="M 45 70 Q 50 66 55 70"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }
  
  // 놀라는 표정 (에러 상황용)
  if (variant === 'surprised') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* 두릅 몸통 - 메인 */}
        <ellipse cx="50" cy="60" rx="25" ry="32" fill="#00A651" />
        
        {/* 두릅 잎 - 왼쪽 (더 올라간) */}
        <ellipse cx="32" cy="28" rx="8" ry="20" fill="#00C962" transform="rotate(-40 32 28)" />
        
        {/* 두릅 잎 - 가운데 (더 올라간) */}
        <ellipse cx="50" cy="22" rx="9" ry="24" fill="#00C962" />
        
        {/* 두릅 잎 - 오른쪽 (더 올라간) */}
        <ellipse cx="68" cy="28" rx="8" ry="20" fill="#00C962" transform="rotate(40 68 28)" />
        
        {/* 얼굴 - 눈 왼쪽 (크게 뜬 눈) */}
        <circle cx="43" cy="57" r="4.5" fill="#FFFFFF" />
        <circle cx="43.5" cy="57" r="2.5" fill="#333333" />
        <circle cx="44.5" cy="56" r="1" fill="#FFFFFF" />
        
        {/* 얼굴 - 눈 오른쪽 (크게 뜬 눈) */}
        <circle cx="57" cy="57" r="4.5" fill="#FFFFFF" />
        <circle cx="57.5" cy="57" r="2.5" fill="#333333" />
        <circle cx="58.5" cy="56" r="1" fill="#FFFFFF" />
        
        {/* 얼굴 - 입 (놀란 입) */}
        <ellipse cx="50" cy="68" rx="4" ry="5" fill="#FFFFFF" />
        <ellipse cx="50" cy="69" rx="3" ry="3.5" fill="#333333" opacity="0.3" />
        
        {/* 놀람 표시 (왼쪽) */}
        <path
          d="M 28 52 L 30 48 L 26 47"
          stroke="#FFD700"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* 놀람 표시 (오른쪽) */}
        <path
          d="M 72 52 L 70 48 L 74 47"
          stroke="#FFD700"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }
  
  // 미안해하는/거절하는 표정 (403 권한 없음용)
  if (variant === 'sorry') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* 두릅 몸통 - 메인 */}
        <ellipse cx="50" cy="60" rx="25" ry="32" fill="#00A651" />
        
        {/* 두릅 잎 - 왼쪽 (약간 숙인) */}
        <ellipse cx="35" cy="37" rx="8" ry="18" fill="#00C962" transform="rotate(-30 35 37)" />
        
        {/* 두릅 잎 - 가운데 (약간 숙인) */}
        <ellipse cx="50" cy="30" rx="9" ry="22" fill="#00C962" />
        
        {/* 두릅 잎 - 오른쪽 (약간 숙인) */}
        <ellipse cx="65" cy="37" rx="8" ry="18" fill="#00C962" transform="rotate(30 65 37)" />
        
        {/* 얼굴 - 눈 왼쪽 (미안한 눈) */}
        <path
          d="M 40 57 Q 43 55 46 57"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* 얼굴 - 눈 오른쪽 (미안한 눈) */}
        <path
          d="M 54 57 Q 57 55 60 57"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* 얼굴 - 입 (미안한 입) */}
        <path
          d="M 43 68 Q 46 67 50 67 Q 54 67 57 68"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* 땀방울 왼쪽 */}
        <ellipse cx="36" cy="54" rx="2" ry="3" fill="#8DD5F7" opacity="0.7" />
        
        {/* 땀방울 오른쪽 */}
        <ellipse cx="64" cy="54" rx="2" ry="3" fill="#8DD5F7" opacity="0.7" />
        
        {/* 볼 - 왼쪽 (부끄러움) */}
        <circle cx="38" cy="64" r="4" fill="#FFFFFF" opacity="0.5" />
        
        {/* 볼 - 오른쪽 (부끄러움) */}
        <circle cx="62" cy="64" r="4" fill="#FFFFFF" opacity="0.5" />
      </svg>
    );
  }
  
  // 아이콘 버전 (파비콘/앱 아이콘용)
  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* 배경 원 */}
        <circle cx="50" cy="50" r="48" fill="#00A651" />
        
        {/* 두릅 잎 - 왼쪽 */}
        <ellipse cx="35" cy="35" rx="8" ry="18" fill="#00C962" transform="rotate(-25 35 35)" />
        
        {/* 두릅 잎 - 가운데 */}
        <ellipse cx="50" cy="28" rx="9" ry="22" fill="#00C962" />
        
        {/* 두릅 잎 - 오른쪽 */}
        <ellipse cx="65" cy="35" rx="8" ry="18" fill="#00C962" transform="rotate(25 65 35)" />
        
        {/* 얼굴 - 눈 왼쪽 */}
        <circle cx="43" cy="53" r="3" fill="#FFFFFF" />
        
        {/* 얼굴 - 눈 오른쪽 */}
        <circle cx="57" cy="53" r="3" fill="#FFFFFF" />
        
        {/* 얼굴 - 입 (미소) */}
        <path
          d="M 42 62 Q 50 68 58 62"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }
  
  // 행복한 표정 (기본)
  if (variant === 'happy') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* 두릅 몸통 - 메인 */}
        <ellipse cx="50" cy="60" rx="25" ry="32" fill="#00A651" />
        
        {/* 두릅 잎 - 왼쪽 */}
        <ellipse cx="35" cy="35" rx="8" ry="18" fill="#00C962" transform="rotate(-25 35 35)" />
        
        {/* 두릅 잎 - 가운데 */}
        <ellipse cx="50" cy="28" rx="9" ry="22" fill="#00C962" />
        
        {/* 두릅 잎 - 오른쪽 */}
        <ellipse cx="65" cy="35" rx="8" ry="18" fill="#00C962" transform="rotate(25 65 35)" />
        
        {/* 얼굴 - 눈 왼쪽 */}
        <circle cx="43" cy="58" r="3" fill="#FFFFFF" />
        <circle cx="43.5" cy="58" r="1.5" fill="#333333" />
        
        {/* 얼굴 - 눈 오른쪽 */}
        <circle cx="57" cy="58" r="3" fill="#FFFFFF" />
        <circle cx="57.5" cy="58" r="1.5" fill="#333333" />
        
        {/* 얼굴 - 입 (미소) */}
        <path
          d="M 45 66 Q 50 70 55 66"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* 볼 - 왼쪽 */}
        <circle cx="38" cy="64" r="3" fill="#FFFFFF" opacity="0.4" />
        
        {/* 볼 - 오른쪽 */}
        <circle cx="62" cy="64" r="3" fill="#FFFFFF" opacity="0.4" />
      </svg>
    );
  }
}
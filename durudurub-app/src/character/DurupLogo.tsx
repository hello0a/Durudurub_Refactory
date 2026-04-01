import { DurupCharacter } from './DurupCharacter';

interface DurupLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'happy' | 'wink' | 'simple' | 'excited' | 'love' | 'thinking' | 'icon';
}

export function DurupLogo({ 
  size = 'md', 
  showText = true,
  variant = 'happy'
}: DurupLogoProps) {
  const sizeMap = {
    sm: { character: 28, text: 'text-lg' },
    md: { character: 40, text: 'text-2xl' },
    lg: { character: 56, text: 'text-4xl' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className="flex items-center gap-2">
      <DurupCharacter size={currentSize.character} variant={variant} />
      {showText && (
        <span className={`${currentSize.text} font-bold text-[#00A651]`}>
          두루두룹
        </span>
      )}
    </div>
  );
}
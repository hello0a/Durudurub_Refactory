import { Play, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface WheelSegment {
  id: string;
  label: string;
  color: string;
}

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B739', '#52B788', '#E07A5F', '#81B29A'
];

export function WheelSpinnerGame() {
  const [segments, setSegments] = useState<WheelSegment[]>([
    { id: '1', label: '1등', color: '#FF6B6B' },
    { id: '2', label: '2등', color: '#4ECDC4' },
    { id: '3', label: '3등', color: '#45B7D1' },
    { id: '4', label: '4등', color: '#FFA07A' },
    { id: '5', label: '5등', color: '#98D8C8' },
    { id: '6', label: '6등', color: '#F7DC6F' },
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    drawWheel();
  }, [segments, rotation]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // 캔 ��기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 회전 적용
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    // 세그먼트 그리기
    const anglePerSegment = (2 * Math.PI) / segments.length;
    
    segments.forEach((segment, index) => {
      const startAngle = index * anglePerSegment - Math.PI / 2;
      const endAngle = startAngle + anglePerSegment;

      // 세그먼트 채우기
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();

      // 테두리
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 텍스트
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(segment.label, radius * 0.65, 5);
      ctx.restore();
    });

    ctx.restore();

    // 중앙 원
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#00A651';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 화살표 (상단 고정)
    ctx.save();
    ctx.fillStyle = '#00A651';
    ctx.beginPath();
    ctx.moveTo(centerX, 10);
    ctx.lineTo(centerX - 15, 40);
    ctx.lineTo(centerX + 15, 40);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };

  const spinWheel = () => {
    if (isSpinning || segments.length === 0) return;

    setIsSpinning(true);
    setResult(null);

    // 랜덤 회전 각도 (최소 5바퀴 + 랜덤)
    const minSpins = 5;
    const randomDegrees = Math.random() * 360;
    const totalRotation = minSpins * 360 + randomDegrees;

    let currentRotation = rotation;
    const duration = 4000; // 4초
    const startTime = Date.now();

    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      // easeOut 효과
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newRotation = currentRotation + totalRotation * easeOut;

      setRotation(newRotation % 360);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 최종 결과 계산
        const finalAngle = newRotation % 360;
        const anglePerSegment = 360 / segments.length;
        const adjustedAngle = (360 - finalAngle + 90) % 360; // 상단 화살표 기준
        const winningIndex = Math.floor(adjustedAngle / anglePerSegment) % segments.length;
        
        setResult(segments[winningIndex].label);
        setIsSpinning(false);
      }
    };

    requestAnimationFrame(animate);
  };

  const addSegment = () => {
    if (segments.length >= 12) {
      alert('최대 12개까지 추가할 수 있습니다.');
      return;
    }

    const newId = String(Date.now());
    const colorIndex = segments.length % DEFAULT_COLORS.length;
    setSegments([
      ...segments,
      { id: newId, label: `항목 ${segments.length + 1}`, color: DEFAULT_COLORS[colorIndex] }
    ]);
  };

  const removeSegment = (id: string) => {
    if (segments.length <= 2) {
      alert('최소 2개 항목이 필요합니다.');
      return;
    }
    setSegments(segments.filter(seg => seg.id !== id));
  };

  const updateSegment = (id: string, label: string) => {
    setSegments(segments.map(seg => 
      seg.id === id ? { ...seg, label } : seg
    ));
  };

  const resetWheel = () => {
    setRotation(0);
    setResult(null);
    setIsSpinning(false);
  };

  return (
    <div className="space-y-8">
      {/* 룰렛 판 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">행운의 룰렛</h2>
        
        <div className="flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="mb-6 max-w-full"
          />

          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className={`bg-[#00A651] text-white font-bold py-4 px-12 rounded-full hover:bg-[#008E41] transition-colors flex items-center gap-2 text-xl shadow-lg ${
              isSpinning ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Play className="w-6 h-6" />
            {isSpinning ? '회전 중...' : '룰렛 돌리기'}
          </button>

          {result && !isSpinning && (
            <div className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 text-center animate-pulse">
              <p className="text-3xl font-bold text-white mb-2">🎉 축하합니다! 🎉</p>
              <p className="text-2xl font-bold text-white">당첨: {result}</p>
            </div>
          )}
        </div>
      </div>

      {/* 설정 패널 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="space-y-3 mb-4 flex flex-col items-center">
          <h2 className="text-xl font-bold text-gray-900">룰렛 항목 설정</h2>
          <div className="flex gap-2">
            <button
              onClick={addSegment}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#00A651] text-white text-sm rounded-lg hover:bg-[#008E41] transition-colors"
            >
              <Plus className="w-4 h-4" />
              추가
            </button>
            <button
              onClick={resetWheel}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              초기화
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {segments.map((segment, index) => (
            <div key={segment.id} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded"
                style={{ backgroundColor: segment.color }}
              ></div>
              <input
                type="text"
                value={segment.label}
                onChange={(e) => updateSegment(segment.id, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A651]"
                placeholder={`항목 ${index + 1}`}
              />
              <button
                onClick={() => removeSegment(segment.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 게임 설명 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">게임 방법</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-[#00A651] font-bold">•</span>
            <span>항목을 추가하거나 수정하여 원하는 내용을 입력하세요.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00A651] font-bold">•</span>
            <span>"룰렛 돌리기" 버튼을 눌러 룰렛을 회전시킵니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00A651] font-bold">•</span>
            <span>룰렛이 멈추면 상단 화살표가 가리키는 항목이 당첨됩니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00A651] font-bold">•</span>
            <span>최소 2개부터 최대 12개까지 항목을 설정할 수 있습니다.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
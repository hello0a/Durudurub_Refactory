import { RotateCcw, Plus, Minus, Eye } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function LadderGame() {
  const [numPlayers, setNumPlayers] = useState(4);
  const [playerNames, setPlayerNames] = useState(['참가자1', '참가자2', '참가자3', '참가자4']);
  const [prizes, setPrizes] = useState(['1등', '2등', '3등', '4등']);
  const [ladderData, setLadderData] = useState<boolean[][]>([]);
  const [clickedParticipants, setClickedParticipants] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<{ player: string; prize: string }[]>([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [canvasHidden, setCanvasHidden] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  const participantColors = ['#ff0000', '#0066ff', '#ff6600', '#9900ff', '#00cc66', '#ff00cc', '#ffcc00', '#00ccff'];

  // 참가자 수 변경시 이름과 상품 배열 업데이트
  useEffect(() => {
    const newPlayerNames = Array(numPlayers).fill(0).map((_, i) => 
      playerNames[i] || `참가자${i + 1}`
    );
    const newPrizes = Array(numPlayers).fill(0).map((_, i) => 
      prizes[i] || `${i + 1}등`
    );
    setPlayerNames(newPlayerNames);
    setPrizes(newPrizes);
  }, [numPlayers]);

  // 사다리 시뮬레이션 (특정 시작점에서 도착점 계산)
  const simulateLadderPath = (startIndex: number, data: boolean[][]): number => {
    let currentCol = startIndex;
    
    data.forEach((row) => {
      if (currentCol > 0 && row[currentCol - 1]) {
        currentCol--;
      } else if (currentCol < numPlayers - 1 && row[currentCol]) {
        currentCol++;
      }
    });
    
    return currentCol;
  };

  // 사다리 데이터 생성 (중복 없는 결과 보장)
  const createLadderData = (): boolean[][] => {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      const rows = 15;
      const newLadderData: boolean[][] = [];
      
      for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        const row: boolean[] = [];
        const isLastRows = rowIndex >= rows - 2;
        let prevHasLine = false;
        
        for (let colIndex = 0; colIndex < numPlayers - 1; colIndex++) {
          if (isLastRows) {
            row.push(false);
          } else if (prevHasLine) {
            row.push(false);
            prevHasLine = false;
          } else {
            const hasLine = Math.random() > 0.4;
            row.push(hasLine);
            prevHasLine = hasLine;
          }
        }
        newLadderData.push(row);
      }
      
      const results: number[] = [];
      for (let i = 0; i < numPlayers; i++) {
        const result = simulateLadderPath(i, newLadderData);
        results.push(result);
      }
      
      // 중복 검사
      const uniqueResults = new Set(results);
      if (uniqueResults.size === numPlayers) {
        console.log(`사다리 생성 성공 (시도 ${attempts}회)`);
        return newLadderData;
      }
    }
    
    console.error('사다리 생성 실패, 기본 사다리 반환');
    return Array(15).fill(null).map(() => Array(numPlayers - 1).fill(false));
  };

  // 사다리 그리기
  const drawLadder = (ctx: CanvasRenderingContext2D, width: number, height: number, data: boolean[][]) => {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#00a651';
    ctx.lineWidth = 2;

    const padding = 80;
    const usableWidth = width - padding * 2;
    const columnSpacing = usableWidth / (numPlayers - 1);
    const rowHeight = height / (data.length + 1);

    // 세로선 그리기
    for (let i = 0; i < numPlayers; i++) {
      const x = padding + i * columnSpacing;
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, height - 20);
      ctx.stroke();
      
      // 시작점 원 그리기
      ctx.beginPath();
      ctx.arc(x, 20, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#00a651';
      ctx.fill();
    }

    // 가로선 그리기
    data.forEach((row, rowIndex) => {
      const y = 20 + (rowIndex + 1) * rowHeight;
      row.forEach((hasLine, colIndex) => {
        if (hasLine) {
          const x1 = padding + colIndex * columnSpacing;
          const x2 = padding + (colIndex + 1) * columnSpacing;
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.stroke();
        }
      });
    });
  };

  // 사다리 생성
  const generateLadder = () => {
    const newLadderData = createLadderData();
    setLadderData(newLadderData);
    setClickedParticipants(new Set());
    setResults([]);
    setShowRetry(false);
    setIsAutoPlaying(false);
    setCanvasHidden(true);

    // 캔버스 초기화
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = 565;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawLadder(ctx, canvas.width, canvas.height, newLadderData);
        }
      }
    }, 10);
  };

  // 사다리 타기 애니메이션
  const animateLadder = (startIndex: number, isAuto: boolean = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 첫 클릭시 캔버스 표시
    if (clickedParticipants.size === 0 && !isAuto) {
      setCanvasHidden(false);
    }

    // 이미 클릭한 참가자는 무시
    if (clickedParticipants.has(startIndex)) {
      return;
    }

    // 클릭한 참가자 추가
    const newClickedParticipants = new Set(clickedParticipants);
    newClickedParticipants.add(startIndex);
    setClickedParticipants(newClickedParticipants);

    const padding = 80;
    const usableWidth = canvas.width - padding * 2;
    const columnSpacing = usableWidth / (numPlayers - 1);
    const rowHeight = canvas.height / (ladderData.length + 1);

    let currentCol = startIndex;
    const path: { x: number; y: number }[] = [{ x: padding + currentCol * columnSpacing, y: 20 }];

    // 경로 계산
    ladderData.forEach((row, rowIndex) => {
      const y = 20 + (rowIndex + 1) * rowHeight;
      
      if (currentCol > 0 && row[currentCol - 1]) {
        path.push({ x: padding + currentCol * columnSpacing, y: y });
        currentCol--;
        path.push({ x: padding + currentCol * columnSpacing, y: y });
      } else if (currentCol < numPlayers - 1 && row[currentCol]) {
        path.push({ x: padding + currentCol * columnSpacing, y: y });
        currentCol++;
        path.push({ x: padding + currentCol * columnSpacing, y: y });
      } else {
        path.push({ x: padding + currentCol * columnSpacing, y: y });
      }
    });

    path.push({ x: padding + currentCol * columnSpacing, y: canvas.height - 20 });

    // 애니메이션
    let step = 0;
    const animationSpeed = 15;
    const pathColor = participantColors[startIndex % participantColors.length];

    const animate = () => {
      if (step < path.length - 1) {
        ctx.strokeStyle = pathColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(path[step].x, path[step].y);
        ctx.lineTo(path[step + 1].x, path[step + 1].y);
        ctx.stroke();
        step++;
        animationRef.current = setTimeout(animate, animationSpeed);
      } else {
        // 애니메이션 완료
        const participantName = playerNames[startIndex];
        const prize = prizes[currentCol];
        
        setResults(prev => [...prev, { player: participantName, prize }]);

        // 모든 참가자 완료시
        if (newClickedParticipants.size === numPlayers) {
          setTimeout(() => {
            setShowRetry(true);
            setIsAutoPlaying(false);
          }, 300);
        }
      }
    };

    animate();
  };

  // 모든 결과 보기
  const showAllResults = () => {
    if (isAutoPlaying) return;
    
    setIsAutoPlaying(true);
    setCanvasHidden(false);
    
    let currentIndex = 0;
    
    const playNext = () => {
      if (currentIndex < numPlayers) {
        if (clickedParticipants.has(currentIndex)) {
          currentIndex++;
          playNext();
          return;
        }
        
        animateLadder(currentIndex, true);
        
        setTimeout(() => {
          currentIndex++;
          playNext();
        }, 1500);
      }
    };
    
    playNext();
  };

  // 다시하기
  const handleRetry = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 초기화
    setClickedParticipants(new Set());
    setResults([]);
    setShowRetry(false);
    setIsAutoPlaying(false);
    setCanvasHidden(true);

    // 새 사다리 생성
    const newLadderData = createLadderData();
    setLadderData(newLadderData);

    canvas.width = canvas.offsetWidth;
    canvas.height = 565;
    drawLadder(ctx, canvas.width, canvas.height, newLadderData);
  };

  return (
    <div className="space-y-8">
      {/* 설정 패널 - 사다리 생성 전에만 표시 */}
      {ladderData.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">사다리 설정</h2>
          
          <div className="space-y-4">
            {/* 참가자 수 조절 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                참가자 수: {numPlayers}명
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setNumPlayers(Math.max(2, numPlayers - 1))}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-[#00A651] rounded-full transition-all"
                    style={{ width: `${((numPlayers - 2) / 6) * 100}%` }}
                  ></div>
                </div>
                <button
                  onClick={() => setNumPlayers(Math.min(8, numPlayers + 1))}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 참가자 이름 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">참가자 이름</label>
              <div className="grid grid-cols-2 gap-2">
                {playerNames.map((name, i) => (
                  <input
                    key={i}
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const newNames = [...playerNames];
                      newNames[i] = e.target.value;
                      setPlayerNames(newNames);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A651]"
                    placeholder={`참가자 ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* 상품 이름 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">결과/상품</label>
              <div className="grid grid-cols-2 gap-2">
                {prizes.map((prize, i) => (
                  <input
                    key={i}
                    type="text"
                    value={prize}
                    onChange={(e) => {
                      const newPrizes = [...prizes];
                      newPrizes[i] = e.target.value;
                      setPrizes(newPrizes);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A651]"
                    placeholder={`결과 ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* 사다리 생성 버튼 */}
            <button
              onClick={generateLadder}
              className="w-full bg-[#00A651] text-white font-bold py-3 rounded-full hover:bg-[#008E41] transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              사다리 생성
            </button>
          </div>
        </div>
      )}

      {/* 사다리 보드 */}
      {ladderData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">사다리 타기</h2>
            {/* 다시 설정하기 버튼 */}
            <button
              onClick={() => {
                setLadderData([]);
                setClickedParticipants(new Set());
                setResults([]);
                setShowRetry(false);
                setIsAutoPlaying(false);
                setCanvasHidden(true);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-medium">다시 설정</span>
            </button>
          </div>
          
          {/* 참가자 버튼 */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {playerNames.map((name, i) => (
              <button
                key={i}
                onClick={() => animateLadder(i)}
                disabled={clickedParticipants.has(i) || isAutoPlaying}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  clickedParticipants.has(i)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#00A651] text-white hover:bg-[#008E41]'
                } ${isAutoPlaying ? 'cursor-not-allowed opacity-50' : ''}`}
                style={{
                  backgroundColor: clickedParticipants.has(i) 
                    ? participantColors[i % participantColors.length] + '40'
                    : clickedParticipants.has(i) ? undefined : '#00A651'
                }}
              >
                {name}
              </button>
            ))}
          </div>

          {/* 캔버스 */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={565}
              className={`w-full border-2 border-gray-200 rounded-xl transition-opacity ${
                canvasHidden ? 'opacity-0' : 'opacity-100'
              }`}
            />
            {canvasHidden && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border-2 border-gray-200 rounded-xl">
                <p className="text-gray-500 text-lg">참가자를 선택하여 사다리를 타보세요!</p>
              </div>
            )}
          </div>

          {/* 결과 표시 */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {prizes.map((prize, i) => {
              const isWinner = results.some(r => r.prize === prize);
              return (
                <div
                  key={i}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isWinner
                      ? 'bg-yellow-400 text-gray-900 animate-pulse'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {prize}
                </div>
              );
            })}
          </div>

          {/* 결과 메시지 */}
          {results.length > 0 && (
            <div className="mt-6 bg-[#00A651]/10 rounded-xl p-4">
              <div className="space-y-2">
                {results.map((result, idx) => (
                  <p key={idx} className="text-[#00A651] font-medium">
                    🎉 {result.player}님의 결과는 "{result.prize}"입니다!
                  </p>
                ))}
                {clickedParticipants.size === numPlayers && (
                  <p className="text-lg font-bold text-[#00A651] mt-4">
                    ✅ 모든 참가자의 결과가 확인되었습니다!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 모든 결과 보기 & 다시하기 버튼 */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={showAllResults}
              disabled={clickedParticipants.size === numPlayers || isAutoPlaying}
              className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              모든 결과 보기
            </button>
            {showRetry && (
              <button
                onClick={handleRetry}
                className="flex-1 px-4 py-3 bg-[#00A651] text-white rounded-lg hover:bg-[#008E41] transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                다시하기
              </button>
            )}
          </div>
        </div>
      )}

      {/* 게임 설명 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">게임 방법</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-[#00A651] font-bold">•</span>
            <span>참가자 수를 선택하고 참가자 이름과 결과/상품을 입력하세요.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00A651] font-bold">•</span>
            <span>"사다리 생성" 버튼을 눌러 무작위 사다리를 생성합니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00A651] font-bold">•</span>
            <span>참가자 버튼을 클릭하여 사다리를 타고 결과를 확인하세요.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00A651] font-bold">•</span>
            <span>색깔 선이 경로를 표시하고 최종 결과를 알려줍니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00A651] font-bold">•</span>
            <span>"모든 결과 보기" 버튼으로 전체 참가자의 결과를 한번에 확인할 수 있습니다.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

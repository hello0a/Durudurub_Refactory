import { Play, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Participant {
  id: string;
  name: string;
}

export function WinnerDrawGame() {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: '참가자1' },
    { id: '2', name: '참가자2' },
    { id: '3', name: '참가자3' },
    { id: '4', name: '참가자4' },
    { id: '5', name: '참가자5' },
  ]);
  const [numWinners, setNumWinners] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winners, setWinners] = useState<Participant[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<string | null>(null);

  const addParticipant = () => {
    const newId = String(Date.now());
    setParticipants([
      ...participants,
      { id: newId, name: `참가자${participants.length + 1}` }
    ]);
  };

  const removeParticipant = (id: string) => {
    if (participants.length <= 1) {
      alert('최소 1명의 참가자가 필요합니다.');
      return;
    }
    setParticipants(participants.filter(p => p.id !== id));
  };

  const updateParticipant = (id: string, name: string) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, name } : p
    ));
  };

  const drawWinners = async () => {
    if (participants.length < numWinners) {
      alert('당첨자 수가 참가자 수보다 많습니다.');
      return;
    }

    setIsDrawing(true);
    setWinners([]);
    setCurrentDrawing(null);

    // 참가자 복사
    const availableParticipants = [...participants];
    const selectedWinners: Participant[] = [];

    // 애니메이션을 위한 순차 추첨
    for (let i = 0; i < numWinners; i++) {
      // 빠른 롤링 효과 (20번)
      for (let j = 0; j < 20; j++) {
        const randomIndex = Math.floor(Math.random() * availableParticipants.length);
        setCurrentDrawing(availableParticipants[randomIndex].name);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // 최종 당첨자 선택
      const winnerIndex = Math.floor(Math.random() * availableParticipants.length);
      const winner = availableParticipants[winnerIndex];
      selectedWinners.push(winner);
      availableParticipants.splice(winnerIndex, 1);

      setCurrentDrawing(winner.name);
      await new Promise(resolve => setTimeout(resolve, 800));

      setWinners([...selectedWinners]);
      setCurrentDrawing(null);
      
      if (i < numWinners - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsDrawing(false);
  };

  const reset = () => {
    setWinners([]);
    setCurrentDrawing(null);
    setIsDrawing(false);
  };

  const clearAll = () => {
    setParticipants([
      { id: '1', name: '참가자1' },
    ]);
    reset();
  };

  return (
    <div className="space-y-8">
      {/* 추첨 화면 */}
      <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-lg p-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-8">🎁 당첨자 추첨 🎁</h2>
        
        {!isDrawing && winners.length === 0 && (
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-12">
            <p className="text-2xl text-white font-medium">추첨을 시작해주세요</p>
            <p className="text-lg text-white/80 mt-2">총 {participants.length}명 참가 중</p>
          </div>
        )}

        {(isDrawing || currentDrawing) && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 animate-pulse">
            <p className="text-5xl font-bold text-purple-600 mb-4">
              {currentDrawing || '추첨 중...'}
            </p>
            <p className="text-xl text-gray-600">누가 당첨될까요?</p>
          </div>
        )}

        {!isDrawing && winners.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8">
              <p className="text-2xl font-bold text-purple-600 mb-6">🎉 당첨자 발표 🎉</p>
              <div className="space-y-3">
                {winners.map((winner, index) => (
                  <div
                    key={winner.id}
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 animate-bounce"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <p className="text-2xl font-bold text-white">
                      {numWinners > 1 ? `${index + 1}등: ` : ''}{winner.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={drawWinners}
            disabled={isDrawing || participants.length === 0}
            className={`bg-white text-purple-600 font-bold p-4 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center shadow-lg ${
              isDrawing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Play className="w-6 h-6" />
          </button>

          {winners.length > 0 && (
            <button
              onClick={reset}
              className="bg-white/80 text-gray-700 font-bold p-4 rounded-full hover:bg-white transition-colors flex items-center justify-center shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 설정 패널 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 참가자 목록 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              참가자 목록
            </h2>
            <div className="flex gap-2">
              <button
                onClick={addParticipant}
                className="flex items-center gap-2 px-4 py-2 bg-[#00A651] text-white rounded-lg hover:bg-[#008E41] transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                추가
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                전체 삭제
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {participants.map((participant, index) => (
              <div key={participant.id} className="flex items-center gap-2">
                <span className="w-8 text-center text-gray-500 font-medium">{index + 1}</span>
                <input
                  type="text"
                  value={participant.name}
                  onChange={(e) => updateParticipant(participant.id, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A651]"
                  placeholder={`참가자 ${index + 1}`}
                />
                <button
                  onClick={() => removeParticipant(participant.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 추첨 설정 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">추첨 설정</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                당첨자 수: {numWinners}명
              </label>
              <input
                type="range"
                min="1"
                max={Math.min(participants.length, 10)}
                value={numWinners}
                onChange={(e) => setNumWinners(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00A651]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1명</span>
                <span>{Math.min(participants.length, 10)}명</span>
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-purple-600">{participants.length}명</span> 중{' '}
                <span className="font-bold text-purple-600">{numWinners}명</span>을 추첨합니다
              </p>
              <p className="text-xs text-gray-600 mt-1">
                당첨 확률: {participants.length > 0 ? ((numWinners / participants.length) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 게임 설명 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">게임 방법</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-[#00A651] font-bold">•</span>
            <span>참가자 이름을 입력하세요.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00A651] font-bold">•</span>
            <span>당첨자 수를 설정하고 "추첨 시작" 버튼을 클릭합니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00A651] font-bold">•</span>
            <span>추첨 애니메이션 후 당첨자가 발표됩니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#00A651] font-bold">•</span>
            <span>공정한 무작위 추첨으로 모든 참가자에게 동등한 기회가 주어집니다.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
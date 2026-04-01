import { DurupCharacter } from '@/character/DurupCharacter';

export function Error500Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <DurupCharacter size={150} variant="sorry" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-6">500 에러 페이지</h1>
        <div className="space-y-4">
          <p className="text-2xl text-gray-700">서버 오류가 발생했습니다.</p>
          <h5 className="text-lg text-gray-600">죄송해요, 잠시 후 다시 시도해주세요</h5>
          <div className="mt-8">
            <a 
              href="/" 
              className="inline-block bg-[#00A651] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#008F44] transition-colors"
            >
              메인 화면
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

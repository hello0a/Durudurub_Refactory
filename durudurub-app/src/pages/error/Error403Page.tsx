import { DurupCharacter } from '@/character/DurupCharacter';

export function Error403Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <DurupCharacter size={150} variant="sad" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-6">403 에러 페이지</h1>
        <div className="space-y-4">
          <p className="text-2xl text-gray-700">접근 권한이 없습니다.</p>
          <h5 className="text-lg text-gray-600">이 페이지에 접근할 수 있는 권한이 없어요</h5>
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

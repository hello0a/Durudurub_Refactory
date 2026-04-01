import { Facebook, Instagram, Youtube } from 'lucide-react';

interface FooterProps {
  onNoticeClick?: () => void;
  onIconsClick?: () => void;
}

export function Footer({ onNoticeClick, onIconsClick }: FooterProps) {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 상단 영역 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* 회사 정보 - 모바일에서 숨김 */}
          <div className="col-span-2 md:col-span-2 hidden md:block">
            <h3 className="text-2xl font-bold text-[#00A651] mb-4">두루두룹</h3>
            <p className="text-gray-600 text-sm mb-4">
              새로운 사람들과 함께하는 특별한 경험,<br />
              두루두룹에서 시작하세요.
            </p>
            {/* SNS 아이콘 */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-[#00A651] hover:text-white transition-colors"
                aria-label="페이스북"
                onClick={onIconsClick}
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-[#00A651] hover:text-white transition-colors"
                aria-label="인스타그램"
                onClick={onIconsClick}
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-[#00A651] hover:text-white transition-colors"
                aria-label="유튜브"
                onClick={onIconsClick}
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">서비스</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-[#00A651] transition-colors">
                  모임 찾기
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-[#00A651] transition-colors">
                  모임 만들기
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-[#00A651] transition-colors">
                  이용 가이드
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-[#00A651] transition-colors">
                  자주 묻는 질문
                </a>
              </li>
            </ul>
          </div>

          {/* 회사 */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">회사</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-[#00A651] transition-colors">
                  회사 소개
                </a>
              </li>
              <li>
                <button
                  onClick={onNoticeClick}
                  className="text-sm text-gray-600 hover:text-[#00A651] transition-colors"
                >
                  공지사항
                </button>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-[#00A651] transition-colors">
                  이용약관
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-[#00A651] transition-colors">
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200 pt-8">
          {/* 하단 정보 */}
          <div className="text-sm text-gray-500 space-y-1">
            <p>㈜두루두룹 | 대표이사: 홍길동 | 사업자등록번호: 123-45-67890</p>
            <p>주소: 서울특별시 강남구 테헤란로 123, 4층</p>
            <p>이메일: contact@durudurub.com | 고객센터: 1588-0000 (평일 10:00 - 18:00)</p>
          </div>

          {/* 저작권 */}
          <p className="text-sm text-gray-400 mt-6">
            © 2026 Durudurub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
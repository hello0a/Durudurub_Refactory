import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { Navbar } from '@/components/header/Navbar';
import { toast } from 'sonner';

interface NoticeWritePageProps {
  onBack: () => void;
  user: any;
  accessToken: string | null;
  onSignupClick?: () => void;
  onLoginClick?: () => void;
  onLogoClick?: () => void;
  onMyPageClick?: () => void;
  onMiniGameClick?: () => void;
  onMyMeetingsClick?: () => void;
  profileImage?: string | null;
  onLogout?: () => void;
  editingNotice?: Notice | null;
}

interface Notice {
  noticeNo: number;
  title: string;
  regDate: string;
  views: number;
  category: '공지' | '이벤트' | '업데이트' | '점검';
  content: string;
  important: boolean;
}

export function NoticeWritePage({ 
  onBack, 
  user, 
  accessToken, 
  onSignupClick, 
  onLoginClick, 
  onLogoClick, 
  onMyPageClick, 
  onMiniGameClick, 
  onMyMeetingsClick, 
  profileImage, 
  onLogout,
  editingNotice 
}: NoticeWritePageProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '공지' as Notice['category'],
    important: false,
  });

  useEffect(() => {
    if (editingNotice) {
      setFormData({
        title: editingNotice.title,
        content: editingNotice.content,
        category: editingNotice.category,
        important: editingNotice.important,
      });
    }
  }, [editingNotice]);

  const payload = {
    title: formData.title,
    content: formData.content,
    category: formData.category, // 배열
    important: formData.important,  // 이름 변경
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = sessionStorage.getItem('accessToken');

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      const url = editingNotice
        ? `/api/admin/notice/${editingNotice.noticeNo}/update`
        : `/api/admin/notice/create`;

      console.log('공지사항 작성/수정 요청:', {
        url,
        method: editingNotice ? 'PUT' : 'POST',
        accessToken: accessToken ? '있음' : '없음',
        formData
      });

      const response = await fetch(url, {
        method: editingNotice ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("category Error >>>> :", formData.category);

      console.log("json Error >>>> :", JSON.stringify(payload));

      const data = await response.json();
      
      console.log('공지사항 작성/수정 응답:', {
        status: response.status,
        data
      });

      if (response.ok) {
        toast.success(editingNotice ? '공지사항이 수정되었습니다.' : '공지사항이 작성되었습니다.');
        onBack();
      } else {
        console.error('공지사항 작성/수정 실패:', data);
        
        // JWT 에러인 경우 특별 처리
        if (response.status === 401 || data.message === 'Invalid JWT') {
          alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
          // 로컬 스토리지 클리어
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          // 페이지 새로고침하여 로그인 상태 초기화
          window.location.reload();
        } else {
          toast.error(data.error || data.message || '공지사항 작성에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('공지사항 저장 실패:', error);
      toast.error('공지사항 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingNotice ? '공지사항 수정' : '공지사항 작성'}
            </h1>
          </div>
        </div>
      </div>

      {/* 폼 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8">
          <div className="space-y-6">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A651]"
                placeholder="공지사항 제목을 입력하세요"
                required
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 *
              </label>
              <div className="flex flex-wrap gap-3">
                {(['공지', '이벤트', '업데이트', '점검'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      formData.category === cat
                        ? 'bg-[#00A651] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 중요 공지 */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.important}
                  onChange={(e) => setFormData({ ...formData, important: e.target.checked })}
                  className="w-5 h-5 text-[#00A651] border-gray-300 rounded focus:ring-[#00A651] cursor-pointer"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  중요 공지로 표시 (상단 고정)
                </span>
              </label>
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A651] resize-vertical"
                placeholder="공지사항 내용을 입력하세요"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                * 줄바꿈은 자동으로 적용됩니다
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#00A651] text-white rounded-lg font-medium hover:bg-[#008f47] transition-colors"
              >
                {editingNotice ? '수정' : '작성'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

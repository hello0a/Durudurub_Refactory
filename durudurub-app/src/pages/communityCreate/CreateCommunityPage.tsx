import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Upload, MapPin, Calendar, Users, FileText, ArrowLeft } from 'lucide-react';
import api from '@/api/axios';

// 커스텀 마커 아이콘 생성
const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      position: relative;
      width: 40px;
      height: 40px;
    ">
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 40px;
        height: 40px;
        background-color: #00A651;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 16px;
        height: 16px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

interface CreateCommunityPageProps {
  onBack: () => void;
  user: any;
  onSignupClick: () => void;
  onLoginClick: () => void;
  onLogoClick: () => void;
  onNoticeClick: () => void;
  onMyPageClick: () => void;
  onMiniGameClick: () => void;
  onMyMeetingsClick: () => void;
  profileImage: string | null;
  onLogout: () => void;
}

export function CreateCommunityPage({ onBack, user, onSignupClick, onLoginClick, onLogoClick, onNoticeClick, onMyPageClick, onMiniGameClick, onMyMeetingsClick, profileImage, onLogout }: CreateCommunityPageProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryNo: '',
    subCategoryNo: '',
    location: '서울특별시 강남구 테헤란로 152',
    maxMembers: '',
    clubDate: '',
  });
  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [apiSubCategories, setApiSubCategories] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([37.5665, 126.9780]); // 서울 중심
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // 카테고리 목록 조회
  useEffect(() => {
    api.get('/api/clubs/categories')
      .then(res => setApiCategories(res.data))
      .catch(err => console.error('카테고리 조회 실패', err));
  }, []);

  // 소분류 카테고리 조회
  useEffect(() => {
    if (formData.categoryNo) {
      api.get(`/api/clubs/subcategories/${formData.categoryNo}`)
        .then(res => setApiSubCategories(res.data))
        .catch(err => console.error('소분류 조회 실패', err));
    } else {
      setApiSubCategories([]);
    }
  }, [formData.categoryNo]);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // 지도 생성
    const map = L.map(mapRef.current).setView(markerPosition, 13);
    
    // 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 마커 추가
    const marker = L.marker(markerPosition, { icon: customIcon }).addTo(map);
    markerRef.current = marker;

    // 클릭 이벤트
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition([lat, lng]);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    });

    leafletMapRef.current = map;

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);



  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('categoryNo', formData.categoryNo);
      if (formData.subCategoryNo) {
        data.append('subCategoryNo', formData.subCategoryNo);
      }
      data.append('location', formData.location);
      data.append('maxMembers', formData.maxMembers);
      data.append('clubDate', formData.clubDate);
      data.append('lat', String(markerPosition[0]));
      data.append('lng', String(markerPosition[1]));
      if (imageFile) {
        data.append('thumbnail', imageFile);
      }

      await api.post('/api/clubs', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('모임이 성공적으로 생성되었습니다!');
      onBack();
    } catch (err: any) {
      console.error('Error creating community:', err);
      setError(err.response?.data || err.message || '모임 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 뒤로가기 버튼 */}
      <div className="md:hidden sticky top-16 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <button
          onClick={onBack}
          className="flex items-center justify-center text-gray-700 hover:text-[#00A651] transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>
      </div>
      
      {/* 폼 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          {/* 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              모임 대표 이미지
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-40 h-40 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-block px-6 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  이미지 선택
                </label>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG 형식 (최대 5MB)</p>
              </div>
            </div>
          </div>

          {/* 모임 제목 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              모임 제목 *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
              placeholder="예: 주말 등산 모임"
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label htmlFor="categoryNo" className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 *
            </label>
            <select
              id="categoryNo"
              required
              value={formData.categoryNo}
              onChange={(e) => setFormData({ ...formData, categoryNo: e.target.value, subCategoryNo: '' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
            >
              <option value="">카테고리를 선택하세요</option>
              {apiCategories.map((cat) => (
                <option key={cat.no} value={cat.no}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* 소분류 카테고리 */}
          {apiSubCategories.length > 0 && (
            <div>
              <label htmlFor="subCategoryNo" className="block text-sm font-medium text-gray-700 mb-2">
                소분류 카테고리 *
              </label>
              <select
                id="subCategoryNo"
                required
                value={formData.subCategoryNo}
                onChange={(e) => setFormData({ ...formData, subCategoryNo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
              >
                <option value="">소분류 카테고리를 선택하세요</option>
                {apiSubCategories.map((subcat: any) => (
                  <option key={subcat.no} value={subcat.no}>{subcat.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 모임 설명 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              모임 설명 *
            </label>
            <textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent resize-none"
              placeholder="모임에 대해 자세히 설명해주세요"
            />
          </div>

          {/* 위치 */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              모임 장소 *
            </label>
            <div className="mb-2">
              <div ref={mapRef} style={{ height: '320px', borderRadius: '0.75rem' }} className="border border-gray-300"></div>
            </div>
            <input
              type="text"
              id="location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
              placeholder="지도를 클릭하여 장소를 선택하거나 직접 입력하세요"
            />
          </div>

          {/* 최대 인원 */}
          <div>
            <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              최대 인원 *
            </label>
            <input
              type="number"
              id="maxMembers"
              required
              min="2"
              max="50"
              value={formData.maxMembers}
              onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
              placeholder="예: 20"
            />
            <p className="text-sm text-gray-500 mt-1">최소 2명 ~ 최대 50명</p>
          </div>

          {/* 일정 */}
          <div>
            <label htmlFor="clubDate" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              모임 일정 *
            </label>
            <input
              type="datetime-local"
              id="clubDate"
              required
              value={formData.clubDate}
              onChange={(e) => setFormData({ ...formData, clubDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] focus:border-transparent"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* 제출 버튼 */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[#00A651] text-white rounded-xl hover:bg-[#008f46] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '생성 중...' : '모임 만들기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
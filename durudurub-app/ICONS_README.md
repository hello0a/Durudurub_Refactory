# 두루두룹 아이콘 갤러리 가이드

## 🎨 아이콘 갤러리 접근 방법

아이콘 갤러리를 보려면 브라우저 콘솔에서 다음 코드를 실행하세요:

```javascript
// App.tsx의 currentPage 상태를 'icons'로 변경
window.location.reload();
// 그 다음 콘솔에서:
document.querySelector('[data-page]')?.click();
```

**더 쉬운 방법:**

1. 브라우저 개발자 도구(F12)를 열기
2. 콘솔 탭으로 이동
3. 다음 코드 붙여넣기:
```javascript
localStorage.setItem('showIconsPage', 'true');
window.location.reload();
```

## 📦 아이콘 컴포넌트 사용 방법

### DurupCharacter 컴포넌트

귀여운 두룹이 캐릭터를 표시합니다.

```tsx
import { DurupCharacter } from '@/app/components/DurupCharacter';

// 기본 사용
<DurupCharacter size={100} variant="happy" />

// 다양한 표정
<DurupCharacter size={80} variant="happy" />    // 행복
<DurupCharacter size={80} variant="wink" />     // 윙크
<DurupCharacter size={80} variant="excited" />  // 신남
<DurupCharacter size={80} variant="love" />     // 사랑 (하트 눈)
<DurupCharacter size={80} variant="thinking" /> // 생각중
<DurupCharacter size={80} variant="sad" />      // 슬픔
<DurupCharacter size={80} variant="surprised" />// 놀람
<DurupCharacter size={80} variant="sorry" />    // 미안
<DurupCharacter size={80} variant="simple" />   // 심플 (얼굴 없음)
<DurupCharacter size={80} variant="icon" />     // 아이콘 (파비콘용)
```

#### Props
- `size?: number` - 아이콘 크기 (기본값: 100)
- `variant?: string` - 표정 타입 (기본값: 'happy')
- `className?: string` - 추가 CSS 클래스

### DurupLogo 컴포넌트

두루두룹 로고를 텍스트와 함께 표시합니다.

```tsx
import { DurupLogo } from '@/app/components/DurupLogo';

// 기본 사용
<DurupLogo />

// 사이즈 조절
<DurupLogo size="sm" />   // 작은 사이즈
<DurupLogo size="md" />   // 중간 사이즈
<DurupLogo size="lg" />   // 큰 사이즈

// 텍스트 숨기기
<DurupLogo showText={false} />

// 표정 변경
<DurupLogo variant="excited" />
```

#### Props
- `size?: 'sm' | 'md' | 'lg'` - 로고 크기 (기본값: 'md')
- `showText?: boolean` - 텍스트 표시 여부 (기본값: true)
- `variant?: string` - 캐릭터 표정 (기본값: 'happy')

## 🎭 아이콘 변형 목록

### 1. happy (행복)
기본 미소 표정 - 가장 자주 사용되는 기본 표정

### 2. wink (윙크)
장난스러운 윙크 - 재미있거나 가벼운 상황에 적합

### 3. excited (신남)
활기찬 표정 - 좋은 소식이나 이벤트 알림에 사용

### 4. love (사랑)
하트 눈 표정 - 좋아요, 즐겨찾기, 감사 표현에 적합

### 5. thinking (생각중)
고민하는 표정 - 로딩, 처리중, 고민 상황에 사용

### 6. sad (슬픔)
슬픈 표정 - 404, 500 에러나 실패 상황에 사용

### 7. surprised (놀람)
놀란 표정 - 예상치 못한 에러 상황에 사용

### 8. sorry (미안)
미안한 표정 - 403 권한 에러나 거절 상황에 사용

### 9. simple (심플)
얼굴 없는 버전 - 미니멀한 디자인이 필요할 때

### 10. icon (아이콘)
앱 아이콘용 - 파비콘, 앱 아이콘 등에 최적화

## 🎨 브랜드 컬러

```css
/* 메인 그린 */
#00A651

/* 라이트 그린 */
#00C962

/* 다크 그린 */
#008F44

/* 포인트 핑크 */
#FF6B9D
```

## 💡 활용 예시

### 버튼에 활용
```tsx
<button className="flex items-center gap-2 bg-[#00A651] text-white px-4 py-2 rounded-lg">
  <DurupCharacter size={24} variant="excited" />
  <span>모임 만들기</span>
</button>
```

### 알림 메시지에 활용
```tsx
<div className="flex items-center gap-3 bg-green-50 p-4 rounded-lg">
  <DurupCharacter size={32} variant="excited" />
  <div>
    <p className="font-medium">가입 승인 완료!</p>
    <p className="text-sm text-gray-600">독서 모임에 가입되었습니다</p>
  </div>
</div>
```

### 배지에 활용
```tsx
<span className="inline-flex items-center gap-2 bg-[#00A651] text-white px-3 py-1 rounded-full">
  <DurupCharacter size={20} variant="icon" />
  <span>리더</span>
</span>
```

### 로딩 상태에 활용
```tsx
<div className="flex flex-col items-center">
  <div className="animate-bounce">
    <DurupCharacter size={60} variant="thinking" />
  </div>
  <p className="mt-4">로딩 중...</p>
</div>
```

### 에러 페이지에 활용
```tsx
// 404 페이지
<div className="flex flex-col items-center">
  <DurupCharacter size={120} variant="sad" />
  <h1 className="text-2xl font-bold mt-4">페이지를 찾을 수 없어요</h1>
  <p className="text-gray-600 mt-2">요청하신 페이지가 존재하지 않습니다</p>
</div>

// 403 페이지
<div className="flex flex-col items-center">
  <DurupCharacter size={120} variant="sorry" />
  <h1 className="text-2xl font-bold mt-4">접근 권한이 없어요</h1>
  <p className="text-gray-600 mt-2">이 페이지에 접근할 권한이 없습니다</p>
</div>

// 500 페이지
<div className="flex flex-col items-center">
  <DurupCharacter size={120} variant="surprised" />
  <h1 className="text-2xl font-bold mt-4">서버 오류가 발생했어요</h1>
  <p className="text-gray-600 mt-2">잠시 후 다시 시도해주세요</p>
</div>
```

## 📁 파일 구조

```
/src/app/components/
├── DurupCharacter.tsx  # 캐릭터 아이콘 컴포넌트
├── DurupLogo.tsx       # 로고 컴포넌트
└── IconShowcase.tsx    # 아이콘 갤러리 페이지
```

## 🚀 다음 단계

- [x] 더 많은 표정 추가 (슬픔, 놀람, 미안) - 에러 페이지용
- [ ] 애니메이션 효과 추가
- [ ] SVG 다운로드 기능 구현
- [ ] PNG/JPG 내보내기 기능
- [ ] 커스텀 컬러 변경 기능
- [ ] 스티커 팩 제작

---

**Made with 💚 by 두루두룹 팀**
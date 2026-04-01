import { X, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface MeetingSchedule {
  id: number;
  date: string; // "2026-02-15"
  time: string; // "14:00"
}

interface EditCommunityModalProps {
  title: string;
  description: string;
  location: string;
  maxParticipants: number;
  schedules: MeetingSchedule[];
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    location: string;
    maxParticipants: number;
    schedules: MeetingSchedule[];
  }) => void;
}

export function EditCommunityModal({
  title,
  description,
  location,
  maxParticipants,
  schedules,
  onClose,
  onSave,
}: EditCommunityModalProps) {
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDescription, setEditedDescription] = useState(description);
  const [editedLocation, setEditedLocation] = useState(location);
  const [editedMaxParticipants, setEditedMaxParticipants] = useState(maxParticipants);
  const [editedSchedules, setEditedSchedules] = useState<MeetingSchedule[]>(schedules);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const handleAddSchedule = () => {
    if (!newDate || !newTime) {
      alert('날짜와 시간을 모두 입력해주세요.');
      return;
    }

    if (editedSchedules.length >= 5) {
      alert('일정은 최대 5개까지만 추가할 수 있습니다.');
      return;
    }

    const newSchedule: MeetingSchedule = {
      id: Date.now(),
      date: newDate,
      time: newTime,
    };

    setEditedSchedules([...editedSchedules, newSchedule].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    }));

    setNewDate('');
    setNewTime('');
  };

  const handleRemoveSchedule = (id: number) => {
    setEditedSchedules(editedSchedules.filter(schedule => schedule.id !== id));
  };

  const handleSave = () => {
    if (editedSchedules.length === 0) {
      alert('최소 1개 이상의 모임 일정을 추가해주세요.');
      return;
    }

    onSave({
      title: editedTitle,
      description: editedDescription,
      location: editedLocation,
      maxParticipants: editedMaxParticipants,
      schedules: editedSchedules,
    });
    onClose();
  };

  const formatScheduleDisplay = (schedule: MeetingSchedule) => {
    const date = new Date(`${schedule.date}T${schedule.time}`);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const displayHours = hours <= 12 ? hours : hours - 12;
    const displayMinutes = minutes.toString().padStart(2, '0');

    return `${month}월 ${day}일 (${weekday}) ${period} ${displayHours}:${displayMinutes}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">모임 정보 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 모임 제목 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              모임 제목
            </label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] text-gray-900"
              placeholder="모임 제목을 입력하세요"
            />
          </div>

          {/* 모임 설명 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              모임 설명
            </label>
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] text-gray-900 resize-none"
              rows={4}
              placeholder="모임에 대한 설명을 입력하세요"
            />
          </div>

          {/* 최대 인원 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              최대 인원
            </label>
            <input
              type="number"
              value={editedMaxParticipants}
              onChange={(e) => setEditedMaxParticipants(parseInt(e.target.value))}
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] text-gray-900"
              placeholder="최대 인원을 입력하세요"
            />
          </div>

          {/* 모임 장소 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              모임 장소
            </label>
            <input
              type="text"
              value={editedLocation}
              onChange={(e) => setEditedLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] text-gray-900"
              placeholder="모임 장소를 입력하세요"
            />
          </div>

          {/* 일정 추가 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              모임 일정 추가
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] text-gray-900"
              />
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A651] text-gray-900"
              />
              <button
                onClick={handleAddSchedule}
                className="px-4 py-3 bg-[#00A651] text-white rounded-full hover:bg-[#008E41] transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 일정 목록 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              모임 일정 목록
            </label>
            <div className="space-y-2">
              {editedSchedules.map(schedule => (
                <div key={schedule.id} className="flex items-center justify-between px-4 py-3 border border-gray-300 rounded-xl">
                  <span className="text-gray-900">{formatScheduleDisplay(schedule)}</span>
                  <button
                    onClick={() => handleRemoveSchedule(schedule.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="일정 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!editedTitle.trim() || !editedDescription.trim() || !editedLocation.trim()}
            className="flex-1 px-6 py-3 bg-[#00A651] text-white rounded-full hover:bg-[#008E41] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
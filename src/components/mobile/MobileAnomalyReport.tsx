import React, { useState, useEffect } from 'react';
import { useFacility } from '../../context/FacilityContext';
import { Equipment, ChecklistItem, SeverityLevel, FacilityCategory } from '../../types';
import {
  Camera,
  AlertTriangle,
  Mic,
  MicOff,
  CheckCircle2,
  X,
  Volume2,
  Sparkles,
  Flame,
  Wrench,
  Droplets
} from 'lucide-react';

interface MobileAnomalyReportProps {
  prefilledEquipment?: Equipment | null;
  prefilledChecklistItem?: ChecklistItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MobileAnomalyReport: React.FC<MobileAnomalyReportProps> = ({
  prefilledEquipment,
  prefilledChecklistItem,
  onClose,
  onSuccess
}) => {
  const { equipments, reportAnomaly, showToast } = useFacility();

  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(
    prefilledEquipment?.id || prefilledChecklistItem?.equipmentId || equipments[0]?.id || ''
  );
  const [category, setCategory] = useState<FacilityCategory>(
    prefilledEquipment?.category || prefilledChecklistItem?.category || '기계'
  );
  const [severity, setSeverity] = useState<SeverityLevel>('중요');
  const [title, setTitle] = useState<string>(
    prefilledChecklistItem ? `${prefilledChecklistItem.itemTitle} 이상 감지` : ''
  );
  const [location, setLocation] = useState<string>(
    prefilledEquipment?.location || prefilledChecklistItem?.location || ''
  );
  const [description, setDescription] = useState<string>(
    prefilledChecklistItem?.notes || ''
  );
  const [photoUrl, setPhotoUrl] = useState<string>(
    prefilledChecklistItem?.photoUrl ||
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80'
  );
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Sync location & category when equipment changes
  useEffect(() => {
    const eq = equipments.find(e => e.id === selectedEquipmentId);
    if (eq) {
      setLocation(eq.location);
      setCategory(eq.category);
    }
  }, [selectedEquipmentId, equipments]);

  // Voice recording timer simulation
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleToggleVoiceRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      // simulate speech recognition / voice recording
      setTimeout(() => {
        setIsRecording(false);
        const sampleVoiceNotes = [
          '현장 점검 중 펌프 씰 부위에서 지속적인 누수 및 미세한 고주파 마찰 소음이 확인되었습니다. 예비 부품 수급 후 즉시 교체 필요합니다.',
          '감압 밸브 게이지 연결부 가스켓 노후로 인한 압력 미세 누설이 감지되었습니다.',
          '비상계단 2층 방화문 도어클로저 유압 누유로 완전 폐쇄 불량 상태입니다.'
        ];
        const randomNote = sampleVoiceNotes[Math.floor(Math.random() * sampleVoiceNotes.length)];
        setDescription(prev => (prev ? `${prev}\n[음성 녹음 변환]: ${randomNote}` : `[음성 녹음 변환]: ${randomNote}`));
        showToast('음성 인식 완료', '현장 음성 메모가 텍스트로 변환되었습니다.', 'info');
      }, 3500);
    } else {
      setIsRecording(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('이상사항 제목을 입력해주세요.');
      return;
    }

    reportAnomaly({
      equipmentId: selectedEquipmentId,
      title: title.trim(),
      description: description.trim() || '현장 점검 시 이상 감지 등록됨',
      severity,
      category,
      location,
      photoUrl,
      audioNote: isRecording ? '현장 음성 녹음 첨부됨' : undefined
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">현장 이상사항 즉시 등록</h3>
              <p className="text-[11px] text-slate-500">기계·소방 시설 이상 징후 사진/음성 기록</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Equipment Select */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">대상 설비 *</label>
            <select
              value={selectedEquipmentId}
              onChange={e => setSelectedEquipmentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-rose-500"
            >
              {equipments.map(eq => (
                <option key={eq.id} value={eq.id}>
                  [{eq.category}] {eq.name} ({eq.code}) - {eq.location}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">이상 정도 (긴급도) *</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSeverity('경미')}
                className={`py-2 px-2 rounded-xl font-bold border transition-all ${severity === '경미' ? 'bg-slate-800 text-white border-slate-800 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                🟢 경미 (관찰필요)
              </button>
              <button
                type="button"
                onClick={() => setSeverity('중요')}
                className={`py-2 px-2 rounded-xl font-bold border transition-all ${severity === '중요' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                🟡 중요 (부품교체)
              </button>
              <button
                type="button"
                onClick={() => setSeverity('긴급')}
                className={`py-2 px-2 rounded-xl font-bold border transition-all ${severity === '긴급' ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-400/40' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                🔴 긴급 (즉시정지)
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">이상 증상 요약 *</label>
            <input
              type="text"
              placeholder="예: 수중펌프 2호기 씰 누수 및 진동 발생"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-rose-500 font-medium"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">발생 위치</label>
            <input
              type="text"
              placeholder="예: 지하 2층 수질정화실"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-rose-500"
            />
          </div>

          {/* Detailed Description with Voice to Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">세부 이상 내용</label>
              <button
                type="button"
                onClick={handleToggleVoiceRecord}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all ${isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    음성 인식 중 ({recordingSeconds}s)...
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-blue-600" />
                    음성으로 입력하기
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="이상 징후, 소음, 누수 상태, 위험 요소를 입력하거나 [음성으로 입력하기]를 눌러 현장에서 말하세요."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-rose-500 leading-relaxed"
            />
          </div>

          {/* Field Photo Attachment */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">현장 증빙 사진 (필수)</label>
            <div className="flex items-center gap-3">
              {photoUrl && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  <img src={photoUrl} alt="Anomaly evidence" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center py-0.5">
                    현장 증빙
                  </span>
                </div>
              )}

              <label className="flex-1 border-2 border-dashed border-rose-200 hover:border-rose-500 rounded-2xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-600 hover:text-rose-600 bg-rose-50/30">
                <Camera className="w-5 h-5 text-rose-500 mb-1" />
                <span className="text-[11px] font-bold">현장 사진 촬영 / 사진 선택</span>
                <span className="text-[10px] text-slate-400">터치 2번 이내 즉시 첨부</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-100 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-extrabold flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              이상사항 즉시 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

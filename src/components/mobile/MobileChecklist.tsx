import React, { useState } from 'react';
import { useFacility } from '../../context/FacilityContext';
import { ChecklistItem, FacilityCategory, InspectionCycle } from '../../types';
import {
  CheckCircle,
  XCircle,
  MinusCircle,
  Camera,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Flame,
  Wrench,
  Droplets,
  Sparkles,
  Info,
  Mic
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MobileChecklistProps {
  initialCategory?: FacilityCategory | 'ALL';
  onReportDefectItem: (item: ChecklistItem) => void;
}

export const MobileChecklist: React.FC<MobileChecklistProps> = ({
  initialCategory = 'ALL',
  onReportDefectItem
}) => {
  const { checklistItems, updateChecklistItem, batchSetChecklistStatus, showToast } = useFacility();
  const [selectedCategory, setSelectedCategory] = useState<FacilityCategory | 'ALL'>(initialCategory);
  const [selectedCycle, setSelectedCycle] = useState<InspectionCycle>('일일');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const filteredItems = checklistItems.filter(
    item =>
      (selectedCategory === 'ALL' || item.category === selectedCategory) &&
      item.cycle === selectedCycle
  );

  const checkedCount = filteredItems.filter(i => i.status !== 'UNCHECKED').length;
  const normalCount = filteredItems.filter(i => i.status === 'NORMAL').length;
  const defectCount = filteredItems.filter(i => i.status === 'DEFECT').length;
  const isAllChecked = filteredItems.length > 0 && checkedCount === filteredItems.length;

  const handleStatusChange = (item: ChecklistItem, status: 'NORMAL' | 'DEFECT' | 'NA') => {
    updateChecklistItem(item.id, { status });

    if (status === 'DEFECT') {
      // Prompt direct defect flow
      onReportDefectItem(item);
    } else if (status === 'NORMAL') {
      showToast('점검 완료', `'${item.itemTitle}' 항목을 정상 판정했습니다.`, 'success');
    }
  };

  const handleBatchAllPass = () => {
    batchSetChecklistStatus(selectedCategory, selectedCycle, 'NORMAL');
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handlePhotoUpload = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateChecklistItem(itemId, { photoUrl: reader.result });
          showToast('사진 첨부 완료', '현장 점검 사진이 저장되었습니다.', 'info');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3 pb-24">
      {/* Category Tabs */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl gap-1 text-xs font-bold">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`flex-1 py-2 rounded-xl transition-all ${selectedCategory === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          전체 ({checklistItems.filter(i => i.cycle === selectedCycle).length})
        </button>
        <button
          onClick={() => setSelectedCategory('기계')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${selectedCategory === '기계' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Wrench className="w-3.5 h-3.5" />
          기계
        </button>
        <button
          onClick={() => setSelectedCategory('소방')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${selectedCategory === '소방' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Flame className="w-3.5 h-3.5" />
          소방
        </button>
        <button
          onClick={() => setSelectedCategory('수질/환경')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${selectedCategory === '수질/환경' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Droplets className="w-3.5 h-3.5" />
          수질
        </button>
      </div>

      {/* Cycle Tabs */}
      <div className="flex items-center justify-between px-1">
        <div className="flex gap-1.5 text-xs font-semibold text-slate-600">
          {(['일일', '주간', '월간'] as InspectionCycle[]).map(cycle => (
            <button
              key={cycle}
              onClick={() => setSelectedCycle(cycle)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${selectedCycle === cycle ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              {cycle} 점검표
            </button>
          ))}
        </div>

        {/* 1-Tap Batch Pass Button */}
        {filteredItems.length > 0 && (
          <button
            onClick={handleBatchAllPass}
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            전체 정상(O) 처리
          </button>
        )}
      </div>

      {/* Progress Summary Header */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">진행률</span>
          <span className="font-extrabold text-blue-600">
            {checkedCount}/{filteredItems.length}
          </span>
          <div className="flex items-center gap-1.5 ml-2 text-[11px]">
            <span className="text-emerald-600 font-bold">정상 {normalCount}</span>
            <span className="text-slate-300">|</span>
            <span className="text-rose-600 font-bold">이상 {defectCount}</span>
          </div>
        </div>

        {isAllChecked && (
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            점검 완료됨
          </span>
        )}
      </div>

      {/* Checklist Items Card List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            해당 조건의 점검 항목이 없습니다.
          </div>
        ) : (
          filteredItems.map(item => {
            const isExpanded = expandedItemId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${item.status === 'NORMAL' ? 'border-emerald-200 bg-emerald-50/20' : item.status === 'DEFECT' ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200/90'}`}
              >
                <div className="p-3.5">
                  {/* Top row: Category tag & Equipment info */}
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded font-bold ${item.category === '소방' ? 'bg-rose-100 text-rose-800' : item.category === '수질/환경' ? 'bg-teal-100 text-teal-800' : 'bg-blue-100 text-blue-800'}`}>
                        {item.category}
                      </span>
                      <span className="font-bold text-slate-700 truncate max-w-[160px]">
                        {item.equipmentName}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[10px]">📍 {item.location}</span>
                  </div>

                  {/* Item Title */}
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {item.itemTitle}
                  </h4>

                  {/* Criteria info */}
                  <div className="mt-1 text-[11px] text-slate-500 flex items-start gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>기준: {item.criteria}</span>
                  </div>

                  {/* Direct Measurement Value if measured */}
                  {item.measuredValue && (
                    <div className="mt-2 text-xs font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block text-slate-700">
                      측정값: <strong className="text-slate-900">{item.measuredValue}</strong>
                    </div>
                  )}

                  {/* Tactile Big Action Buttons: O (Normal) / X (Defect) / N/A */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleStatusChange(item, 'NORMAL')}
                      className={`py-2 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all border ${item.status === 'NORMAL' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30 ring-2 ring-emerald-400/40' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'}`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      정상 (O)
                    </button>

                    <button
                      onClick={() => handleStatusChange(item, 'DEFECT')}
                      className={`py-2 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all border ${item.status === 'DEFECT' ? 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-600/30 ring-2 ring-rose-400/40' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'}`}
                    >
                      <XCircle className="w-4 h-4" />
                      이상 (X)
                    </button>

                    <button
                      onClick={() => handleStatusChange(item, 'NA')}
                      className={`py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${item.status === 'NA' ? 'bg-slate-700 text-white border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                    >
                      <MinusCircle className="w-4 h-4" />
                      해당없음
                    </button>
                  </div>

                  {/* Expand Toggle Button for Measurement / Photo / Memo */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <button
                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          세부 계측/사진 닫기
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          세부 계측값 / 사진 첨부
                        </>
                      )}
                    </button>

                    {item.checkedAt && (
                      <span className="text-[10px] text-slate-400">
                        {item.checkedAt} ({item.checkedBy})
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Drawer: Direct measurement input + Photo attachment */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-1 bg-slate-50/80 border-t border-slate-100 space-y-2 text-xs">
                    {/* Measurement Input */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                        계측/측정값 입력 {item.unit && `(${item.unit})`}
                      </label>
                      <input
                        type="text"
                        placeholder={item.targetValue ? `기준: ${item.targetValue}` : '측정 수치 또는 관찰 결과 입력'}
                        value={item.measuredValue || ''}
                        onChange={e => updateChecklistItem(item.id, { measuredValue: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    {/* Memo */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                        현장 특이사항 메모
                      </label>
                      <input
                        type="text"
                        placeholder="특이사항 메모"
                        value={item.notes || ''}
                        onChange={e => updateChecklistItem(item.id, { notes: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                      />
                    </div>

                    {/* Photo attachment */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                        현장 점검 사진 (터치 2번 이내 즉시 첨부)
                      </label>
                      <div className="flex items-center gap-2">
                        {item.photoUrl && (
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-300 shrink-0">
                            <img src={item.photoUrl} alt="Inspection" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <label className="flex-1 py-2 px-3 border border-slate-300 bg-white hover:bg-slate-100 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 text-slate-700 font-medium text-[11px] transition-colors">
                          <Camera className="w-4 h-4 text-slate-500" />
                          {item.photoUrl ? '사진 다시 선택' : '사진 촬영 / 업로드'}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => handlePhotoUpload(item.id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

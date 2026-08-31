import React, { useState } from 'react';
import { AnomalyRecord, RepairType } from '../../types';
import { X, CheckCircle2, Wrench, Upload, Camera, DollarSign, Building } from 'lucide-react';

interface AnomalyResolutionModalProps {
  anomaly: AnomalyRecord | null;
  onClose: () => void;
  onResolve: (data: {
    repairType: RepairType;
    cost: number;
    partsReplaced: string;
    description: string;
    photoUrl?: string;
    contractorName?: string;
  }) => void;
}

export const AnomalyResolutionModal: React.FC<AnomalyResolutionModalProps> = ({
  anomaly,
  onClose,
  onResolve
}) => {
  const [repairType, setRepairType] = useState<RepairType>('자체수리');
  const [cost, setCost] = useState<number>(0);
  const [partsReplaced, setPartsReplaced] = useState('');
  const [description, setDescription] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
  );

  if (!anomaly) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('조치 세부 내용을 입력해주세요.');
      return;
    }

    onResolve({
      repairType,
      cost: Number(cost) || 0,
      partsReplaced: partsReplaced.trim() || '기본 점검 및 조임/세정',
      description: description.trim(),
      photoUrl,
      contractorName: repairType === '외주수리' ? contractorName : undefined
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">이상사항 조치 완료 및 수리이력 등록</h3>
              <p className="text-xs text-slate-500">조치 결과를 등록하면 수리 이력 DB에 자동 저장됩니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Anomaly Summary Pill */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
              {anomaly.equipmentCode}
            </span>
            <span className="font-bold text-slate-800 truncate">{anomaly.equipmentName}</span>
            <span className="text-slate-500">• {anomaly.location}</span>
          </div>
          <p className="text-slate-600 mt-1 line-clamp-1">
            <strong>이상 증상:</strong> {anomaly.title} ({anomaly.description})
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Repair Type Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">수리 구분 *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRepairType('자체수리')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 ${repairType === '자체수리' ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                <Wrench className="w-3.5 h-3.5" />
                자체 수리 (시설팀 직접 조치)
              </button>
              <button
                type="button"
                onClick={() => setRepairType('외주수리')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 ${repairType === '외주수리' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                <Building className="w-3.5 h-3.5" />
                외주 수리 (전문업체 의뢰)
              </button>
            </div>
          </div>

          {/* Contractor Name if 외주 */}
          {repairType === '외주수리' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">외주 수리업체명 *</label>
              <input
                type="text"
                placeholder="예: 신한펌프 AS엔지니어링, (주)한국방재 등"
                value={contractorName}
                onChange={e => setContractorName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
                required={repairType === '외주수리'}
              />
            </div>
          )}

          {/* Cost & Parts Consumed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">발생 비용 (원)</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={cost === 0 ? '' : cost}
                  onChange={e => setCost(Number(e.target.value))}
                  className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:border-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">원</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">소비 자재 / 부품명</label>
              <input
                type="text"
                placeholder="예: SiC 카트리지 씰 1EA"
                value={partsReplaced}
                onChange={e => setPartsReplaced(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">조치 세부 내용 및 결과 *</label>
            <textarea
              rows={3}
              placeholder="예: 신품 부품으로 교체 장착 후 시운전 완료. 누수 및 이상 진동 정상 수치 회복 확인."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
              required
            />
          </div>

          {/* After Photo */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">조치 완료 사진 첨부</label>
            <div className="flex items-center gap-3">
              {photoUrl ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                  <img src={photoUrl} alt="After repair" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center py-0.5">
                    조치 후
                  </span>
                </div>
              ) : null}

              <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-500 hover:text-emerald-600 bg-slate-50/50">
                <Camera className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-medium">현장 사진 촬영 / 파일 선택</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-100 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              조치 완료 확정 및 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

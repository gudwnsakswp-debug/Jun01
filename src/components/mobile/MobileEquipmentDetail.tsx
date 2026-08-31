import React from 'react';
import { useFacility } from '../../context/FacilityContext';
import { Equipment } from '../../types';
import {
  Wrench,
  Flame,
  Calendar,
  Clock,
  QrCode,
  History,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  DollarSign,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface MobileEquipmentDetailProps {
  equipment: Equipment;
  onBack: () => void;
  onOpenChecklist: () => void;
  onOpenReportAnomaly: () => void;
  onOpenQRTag: () => void;
}

export const MobileEquipmentDetail: React.FC<MobileEquipmentDetailProps> = ({
  equipment,
  onBack,
  onOpenChecklist,
  onOpenReportAnomaly,
  onOpenQRTag
}) => {
  const { maintenanceHistory, anomalies } = useFacility();

  const eqMaintenance = maintenanceHistory.filter(m => m.equipmentId === equipment.id);
  const eqAnomalies = anomalies.filter(a => a.equipmentId === equipment.id && a.status !== 'RESOLVED');

  const totalRepairCost = eqMaintenance.reduce((sum, m) => sum + m.cost, 0);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Bar with Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          뒤로가기
        </button>

        <button
          onClick={onOpenQRTag}
          className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200"
        >
          <QrCode className="w-4 h-4" />
          QR 명판 보기
        </button>
      </div>

      {/* Equipment Header Hero */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            <img
              src={equipment.photoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'}
              alt={equipment.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${equipment.category === '소방' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}`}>
                {equipment.category}
              </span>
              <span className="font-mono text-xs font-bold text-slate-500">{equipment.code}</span>
              <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-extrabold ${equipment.status === '정상' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {equipment.status}
              </span>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mt-1 leading-snug">
              {equipment.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              📍 {equipment.location}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={onOpenChecklist}
            className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-blue-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            이 설비 점검표 작성
          </button>
          <button
            onClick={onOpenReportAnomaly}
            className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-rose-600/20"
          >
            <AlertTriangle className="w-4 h-4" />
            현장 이상 등록
          </button>
        </div>
      </div>

      {/* Equipment Specifications Box */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
        <h4 className="text-xs font-extrabold text-slate-900 mb-2.5 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-blue-600" />
          설비 사양 및 설치 정보
        </h4>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div>
            <span className="text-slate-400 text-[11px] block">제조사</span>
            <span className="font-bold text-slate-800">{equipment.manufacturer}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">모델명</span>
            <span className="font-bold text-slate-800">{equipment.modelNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">설치 일자</span>
            <span className="font-bold text-slate-800">{equipment.installedDate}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">교체 주기</span>
            <span className="font-bold text-slate-800">{equipment.replacementCycleMonths}개월 ({equipment.replacementCycleMonths / 12}년)</span>
          </div>

          {/* Dynamic Specs */}
          {Object.entries(equipment.specs).map(([key, val]) => (
            <div key={key} className="col-span-2 pt-1 border-t border-slate-200/60 flex justify-between">
              <span className="text-slate-500 font-semibold text-[11px]">{key}:</span>
              <span className="font-bold text-slate-800 text-[11px]">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Unresolved Issues Banner if any */}
      {eqAnomalies.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            현재 진행 중인 조치 사항 ({eqAnomalies.length}건)
          </div>
          {eqAnomalies.map(a => (
            <div key={a.id} className="text-xs text-rose-900 bg-white/80 p-2.5 rounded-xl border border-rose-200">
              <div className="flex items-center justify-between font-bold">
                <span>{a.title}</span>
                <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded text-[10px]">{a.severity}</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">{a.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Past Maintenance History DB */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
            <History className="w-4 h-4 text-blue-600" />
            과거 고장 수리 및 부품 교체 이력 ({eqMaintenance.length}건)
          </h4>
          <span className="text-[11px] font-bold text-slate-600">
            총 수리비: <strong className="text-blue-600">{totalRepairCost.toLocaleString()}원</strong>
          </span>
        </div>

        {eqMaintenance.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            등록된 과거 수리 이력이 없습니다. (설비 양호)
          </div>
        ) : (
          <div className="space-y-2.5">
            {eqMaintenance.map(maint => (
              <div
                key={maint.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${maint.repairType === '자체수리' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'}`}>
                    {maint.repairType}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{maint.repairDate}</span>
                </div>

                <div className="font-bold text-slate-800">
                  고장 부위: {maint.faultPart}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {maint.description}
                </p>

                <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>자재: <strong>{maint.partsConsumed}</strong></span>
                  <span className="font-bold text-blue-700">{maint.cost.toLocaleString()}원</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { useFacility } from '../../context/FacilityContext';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Wrench,
  Clock,
  ChevronRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Equipment } from '../../types';

interface MobileHomeProps {
  onOpenQR: () => void;
  onOpenChecklist: (category?: '기계' | '소방' | 'ALL') => void;
  onOpenAnomalyReport: () => void;
  onSelectEquipment: (eq: Equipment) => void;
  onOpenStatutory: () => void;
}

export const MobileHome: React.FC<MobileHomeProps> = ({
  onOpenQR,
  onOpenChecklist,
  onOpenAnomalyReport,
  onSelectEquipment,
  onOpenStatutory
}) => {
  const { checklistItems, anomalies, statutoryInspections, equipments, currentUser } = useFacility();

  const dailyItems = checklistItems.filter(i => i.cycle === '일일');
  const checkedDaily = dailyItems.filter(i => i.status !== 'UNCHECKED');
  const defectDaily = dailyItems.filter(i => i.status === 'DEFECT');
  const completionRate = dailyItems.length > 0
    ? Math.round((checkedDaily.length / dailyItems.length) * 100)
    : 0;

  const pendingAnomalies = anomalies.filter(a => a.status !== 'RESOLVED');
  const urgentStatutory = statutoryInspections
    .filter(s => s.status !== 'COMPLETED' && s.dDay <= 30)
    .sort((a, b) => a.dDay - b.dDay);

  return (
    <div className="space-y-4 pb-20">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-5 shadow-lg border border-blue-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-blue-200">현장 안전점검 모바일</span>
          </div>
          <span className="text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-xs font-medium text-slate-300">
            {currentUser?.name || '김시설 주임'}
          </span>
        </div>

        <div className="mt-3">
          <h2 className="text-lg font-extrabold tracking-tight">국민체육센터 시설점검</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            기계실, 수영장 정화실, 소방설비 당일 점검을 시작하세요.
          </p>
        </div>

        {/* Big Action: QR Code Instant Scan */}
        <button
          onClick={onOpenQR}
          className="mt-4 w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-blue-600/30 active:scale-98 transition-all"
        >
          <QrCode className="w-5 h-5" />
          현장 설비 QR코드 스캔 점검
        </button>
      </div>

      {/* Today's Daily Inspection Progress Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">오늘의 정기점검 현황</h3>
              <p className="text-[11px] text-slate-500">일일 점검 대상 {dailyItems.length}개 항목</p>
            </div>
          </div>
          <span className="text-base font-black text-blue-600">{completionRate}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full transition-all duration-500 rounded-full ${completionRate === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
            style={{ width: `${completionRate}%` }}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 text-[10px] block">점검 완료</span>
            <span className="font-extrabold text-slate-800 text-sm">{checkedDaily.length}</span>
            <span className="text-[10px] text-slate-400">/{dailyItems.length}</span>
          </div>
          <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-emerald-700 text-[10px] block">정상 판정</span>
            <span className="font-extrabold text-emerald-700 text-sm">
              {checkedDaily.filter(i => i.status === 'NORMAL').length}
            </span>
          </div>
          <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
            <span className="text-rose-700 text-[10px] block">이상 감지</span>
            <span className="font-extrabold text-rose-700 text-sm">{defectDaily.length}</span>
          </div>
        </div>

        {/* Category Jump Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenChecklist('기계')}
            className="p-2.5 bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 rounded-xl text-xs font-bold flex items-center justify-between border border-blue-100 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-blue-600" />
              기계설비 점검표
            </div>
            <ChevronRight className="w-4 h-4 text-blue-400" />
          </button>
          <button
            onClick={() => onOpenChecklist('소방')}
            className="p-2.5 bg-rose-50/70 hover:bg-rose-100/70 text-rose-900 rounded-xl text-xs font-bold flex items-center justify-between border border-rose-100 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              소방설비 점검표
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>

      {/* Urgent Statutory Inspection D-Day Cards */}
      {urgentStatutory.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">법정 점검 D-Day 알림</h3>
                <p className="text-[11px] text-slate-500">법적 의무 도래 일정</p>
              </div>
            </div>
            <button
              onClick={onOpenStatutory}
              className="text-[11px] text-blue-600 font-bold hover:underline flex items-center"
            >
              전체보기 <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {urgentStatutory.slice(0, 2).map(stat => (
              <div
                key={stat.id}
                onClick={onOpenStatutory}
                className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded text-[10px] font-extrabold">
                      D-{stat.dDay}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {stat.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    기한: {stat.nextDueDate} ({stat.contractorName || stat.inspectorType})
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unresolved Anomalies Warning Box */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">미조치 현장 이상사항</h3>
              <p className="text-[11px] text-slate-500">조치 대기 중 {pendingAnomalies.length}건</p>
            </div>
          </div>
          <button
            onClick={onOpenAnomalyReport}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            + 이상 등록
          </button>
        </div>

        {pendingAnomalies.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-400 flex flex-col items-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
            현재 처리 대기 중인 이상사항이 없습니다.
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {pendingAnomalies.slice(0, 3).map(anom => (
              <div
                key={anom.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${anom.severity === '긴급' ? 'bg-rose-600 text-white' : anom.severity === '중요' ? 'bg-amber-600 text-white' : 'bg-slate-600 text-white'}`}>
                      {anom.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {anom.equipmentName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                    {anom.title}
                  </p>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${anom.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'}`}>
                  {anom.status === 'IN_PROGRESS' ? '조치 중' : '이상 감지'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Facility Equipment Directory */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            센터 주요 기계·소방 설비 ({equipments.length}대)
          </div>
          <span className="text-[10px] text-slate-400">QR 스캔으로 빠른 조회</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {equipments.slice(0, 4).map(eq => (
            <button
              key={eq.id}
              onClick={() => onSelectEquipment(eq)}
              className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/70 hover:border-blue-300 transition-all group"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span className="font-mono font-bold text-blue-600">{eq.code}</span>
                <span className={`px-1 rounded text-[9px] font-bold ${eq.status === '정상' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {eq.status}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">
                {eq.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                📍 {eq.location}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useFacility } from '../../context/FacilityContext';
import {
  Wrench,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  QrCode,
  FileText,
  Send,
  ArrowUpRight,
  Droplets,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { KakaoAlimtalkModal } from '../common/KakaoAlimtalkModal';
import { StatutoryInspection, Equipment } from '../../types';

interface PCDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenQRScanner: () => void;
  onSelectEquipment: (eq: Equipment) => void;
}

export const PCDashboard: React.FC<PCDashboardProps> = ({
  onNavigateTab,
  onOpenQRScanner,
  onSelectEquipment
}) => {
  const {
    equipments,
    checklistItems,
    anomalies,
    statutoryInspections,
    maintenanceHistory,
    sendDDayNotification,
    showToast
  } = useFacility();

  const [selectedStatutoryForAlimtalk, setSelectedStatutoryForAlimtalk] = useState<StatutoryInspection | null>(null);
  const [selectedDDayType, setSelectedDDayType] = useState<'d30' | 'd14' | 'd7' | 'd1'>('d7');

  // KPIs
  const dailyChecklist = checklistItems.filter(c => c.cycle === '일일');
  const dailyChecked = dailyChecklist.filter(c => c.status !== 'UNCHECKED');
  const dailyCompletionRate = dailyChecklist.length > 0
    ? Math.round((dailyChecked.length / dailyChecklist.length) * 100)
    : 0;

  const pendingAnomalies = anomalies.filter(a => a.status !== 'RESOLVED');
  const urgentAnomalies = anomalies.filter(a => a.status !== 'RESOLVED' && (a.severity === '긴급' || a.severity === '중요'));
  const dueSoonStatutory = statutoryInspections.filter(s => s.status !== 'COMPLETED' && s.dDay <= 30);

  const totalMaintenanceCost = maintenanceHistory.reduce((sum, m) => sum + m.cost, 0);

  // Equipment Status Data for Pie Chart
  const eqStatusData = [
    { name: '정상', value: equipments.filter(e => e.status === '정상').length, color: '#10B981' },
    { name: '요주의', value: equipments.filter(e => e.status === '요주의').length, color: '#F59E0B' },
    { name: '수리중', value: equipments.filter(e => e.status === '수리중').length, color: '#EF4444' },
    { name: '점검필요', value: equipments.filter(e => e.status === '점검필요').length, color: '#3B82F6' },
  ].filter(d => d.value > 0);

  // Monthly Inspection Trend Data (Simulated 6 months)
  const monthlyTrendsData = [
    { month: '3월', 기계점검율: 98, 소방점검율: 100, 수리비: 85 },
    { month: '4월', 기계점검율: 95, 소방점검율: 100, 수리비: 14.5 },
    { month: '5월', 기계점검율: 99, 소방점검율: 98, 수리비: 0 },
    { month: '6월', 기계점검율: 96, 소방점검율: 100, 수리비: 73.8 },
    { month: '7월', 기계점검율: 100, 소방점검율: 100, 수리비: 6.5 },
    { month: '8월 (현재)', 기계점검율: dailyCompletionRate, 소방점검율: 100, 수리비: 3.5 },
  ];

  // Cost by Equipment
  const costByEquipmentData = [
    { name: '수중펌프 2호기', cost: 850000, count: 1 },
    { name: '체육관 AHU-1', cost: 650000, count: 1 },
    { name: '보일러 1호기', cost: 180000, count: 2 },
    { name: '옥내소화펌프', cost: 88000, count: 1 },
    { name: '염소발생기', cost: 65000, count: 1 },
  ];

  const handleOpenAlimtalk = (stat: StatutoryInspection, dDay: 'd30' | 'd14' | 'd7' | 'd1') => {
    setSelectedStatutoryForAlimtalk(stat);
    setSelectedDDayType(dDay);
  };

  return (
    <div className="space-y-6">
      {/* High Density Metric Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-none">
        {/* Metric 1: Inspection Completion */}
        <div
          onClick={() => onNavigateTab('CHECKLIST')}
          className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-400 transition-colors"
        >
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">금일 점검 완료율</p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900">{dailyCompletionRate}%</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              +12% vs 전주
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${dailyCompletionRate === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
              style={{ width: `${dailyCompletionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 2: Unresolved Anomalies */}
        <div
          onClick={() => onNavigateTab('ANOMALIES')}
          className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-rose-400 transition-colors"
        >
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">미조치 이상사항</p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl font-bold text-rose-600">
              {pendingAnomalies.length < 10 ? `0${pendingAnomalies.length}` : pendingAnomalies.length}{' '}
              <span className="text-sm text-slate-400 font-normal">건</span>
            </span>
            <span className="text-xs text-rose-500 font-medium">
              긴급 {urgentAnomalies.length}건 포함
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3">마지막 실시간 업데이트 동기화</p>
        </div>

        {/* Metric 3: Statutory D-Day with orange accent line */}
        <div
          onClick={() => onNavigateTab('STATUTORY')}
          className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-orange-500 cursor-pointer hover:border-amber-400 transition-colors"
        >
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">법정 점검 디데이</p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900">
              D-{dueSoonStatutory[0]?.dDay ?? 14}
            </span>
            <span className="text-xs font-medium text-orange-600 underline truncate max-w-[120px]">
              {dueSoonStatutory[0]?.title || '종합정밀점검'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3">
            기한: {dueSoonStatutory[0]?.nextDueDate || '2026.09.15'}
          </p>
        </div>

        {/* Metric 4: Monthly Repair Cost */}
        <div
          onClick={() => onNavigateTab('MAINTENANCE_DB')}
          className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-400 transition-colors"
        >
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">이달의 수리 비용</p>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl font-bold text-slate-900">
              ₩{Math.round(totalMaintenanceCost / 1000).toLocaleString()}k
            </span>
            <span className="text-xs font-semibold text-slate-400 italic">예산 40% 사용</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-3">전월 동기 대비 15% 절감</p>
        </div>
      </section>

      {/* Main Content High Density Grid: Real-Time Table + Side Equipment/Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-Time Inspection Status Table & Monthly Charts */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Real-Time Inspection Status Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-none">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                실시간 점검 현황 (기계/소방/수질)
              </h3>
              <button
                onClick={() => onNavigateTab('CHECKLIST')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                전체보기
              </button>
            </div>

            <div className="overflow-x-auto px-4 pb-4">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-white text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 font-semibold">점검 항목</th>
                    <th className="py-2.5 font-semibold">구분</th>
                    <th className="py-2.5 font-semibold">담당자</th>
                    <th className="py-2.5 font-semibold">시간</th>
                    <th className="py-2.5 font-semibold">상태</th>
                    <th className="py-2.5 font-semibold text-right">조치</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {checklistItems.slice(0, 6).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 pr-2">
                        <div className="font-medium text-slate-900">{item.itemTitle}</div>
                        <div className="text-[10px] text-slate-400">{item.equipmentName}</div>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium text-[10px] ${
                            item.category === '기계'
                              ? 'bg-blue-50 text-blue-600'
                              : item.category === '소방'
                              ? 'bg-red-50 text-red-600'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600">{item.checkedBy || '김시설'}</td>
                      <td className="py-2.5 text-slate-500 font-mono text-[11px]">{item.checkedAt ? item.checkedAt.slice(11, 16) : '-'}</td>
                      <td className="py-2.5">
                        {item.status === 'NORMAL' ? (
                          <span className="text-emerald-600 font-bold">정상</span>
                        ) : item.status === 'DEFECT' ? (
                          <span className="text-rose-600 font-bold underline">이상발생</span>
                        ) : (
                          <span className="text-slate-400">대기</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        {item.status === 'DEFECT' ? (
                          <span className="px-2 py-0.5 bg-amber-500 text-white rounded text-[10px] font-bold">
                            조치중
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Completion Rates Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">월별 시설점검 이행률 추이</h3>
                <p className="text-xs text-slate-500">기계·소방 시설 법정 및 정기 점검 100% 목표 달성율</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                연간 평균 98.2%
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendsData}>
                  <defs>
                    <linearGradient id="colorMech" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFire" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', color: '#F8FAFC', borderRadius: '8px', fontSize: '11px', border: 'none' }}
                  />
                  <Area type="monotone" dataKey="기계점검율" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorMech)" />
                  <Area type="monotone" dataKey="소방점검율" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFire)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 mt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-semibold text-slate-700">기계설비 점검률 (%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="font-semibold text-slate-700">소방설비 점검률 (%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Key Equipment Status + High Density Dark Recent History Card */}
        <div className="space-y-6 flex flex-col">
          {/* Key Equipments Condition Bars */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">주요 설비 가동 상태</h3>
              <button
                onClick={() => onNavigateTab('MAINTENANCE_DB')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                상세보기
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-slate-600">중앙 보일러 (Main)</span>
                  <span className="text-blue-600 font-bold">98.2%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-slate-600">수영장 정화 순환펌프</span>
                  <span className="text-blue-600 font-bold">85.5%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-slate-600">저수조 수위 상태</span>
                  <span className="text-emerald-600 font-bold">Optimal</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '72%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* High Density Dark Recent Maintenance History Card */}
          <div className="bg-slate-900 rounded-xl shadow-lg p-5 flex-1 relative overflow-hidden text-white flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  최근 수리 이력
                </h3>
                <button
                  onClick={() => onNavigateTab('MAINTENANCE_DB')}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
                >
                  이력 DB
                </button>
              </div>

              <div className="mt-4 space-y-3.5">
                {maintenanceHistory.slice(0, 2).map((maint) => (
                  <div key={maint.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center flex-none font-mono text-[10px] text-blue-400 border border-slate-700 font-bold">
                      QR
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">{maint.equipmentName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        부품/조치: {maint.partsConsumed || maint.faultPart}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {maint.date} | {maint.repairType} ({maint.technician})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-800 relative z-10">
              <button
                onClick={() => onNavigateTab('REPORT_GENERATOR')}
                className="w-full py-2.5 bg-blue-600 text-xs font-bold rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>월간 통합 보고서 PDF 출력</span>
              </button>
            </div>

            {/* Background SVG Watermark */}
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-white">
              <QrCode className="w-32 h-32" />
            </div>
          </div>

          {/* Statutory D-Day Action Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  법정 점검 D-Day 알림
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('STATUTORY')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                관리
              </button>
            </div>

            <div className="space-y-2.5">
              {statutoryInspections.slice(0, 2).map((stat) => {
                const isUrgent = stat.dDay <= 14 && stat.status !== 'COMPLETED';
                return (
                  <div
                    key={stat.id}
                    className={`p-3 rounded-lg border text-xs transition-all ${
                      isUrgent ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isUrgent ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        D-{stat.dDay}일
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        기한: {stat.nextDueDate}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 text-xs">{stat.title}</div>
                    <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-200/50">
                      <span className="text-[10px] text-slate-500">
                        {stat.contractorName || stat.inspectorType}
                      </span>
                      <button
                        onClick={() => handleOpenAlimtalk(stat, stat.dDay <= 7 ? 'd7' : 'd14')}
                        className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Send className="w-2.5 h-2.5" />
                        알림톡
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Kakao Alimtalk Preview Modal */}
      {selectedStatutoryForAlimtalk && (
        <KakaoAlimtalkModal
          inspection={selectedStatutoryForAlimtalk}
          dDayType={selectedDDayType}
          onClose={() => setSelectedStatutoryForAlimtalk(null)}
          onConfirmSend={() => {
            sendDDayNotification(selectedStatutoryForAlimtalk.id, selectedDDayType);
          }}
        />
      )}
    </div>
  );
};

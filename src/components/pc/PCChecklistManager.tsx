import React, { useState } from 'react';
import { useFacility } from '../../context/FacilityContext';
import { ChecklistItem, FacilityCategory, InspectionCycle } from '../../types';
import {
  CheckCircle,
  XCircle,
  MinusCircle,
  Camera,
  CheckCheck,
  Download,
  Printer,
  Filter,
  Search,
  Wrench,
  Flame,
  Droplets,
  AlertTriangle,
  Info,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PCChecklistManagerProps {
  onOpenReportDefect: (item: ChecklistItem) => void;
}

export const PCChecklistManager: React.FC<PCChecklistManagerProps> = ({
  onOpenReportDefect
}) => {
  const { checklistItems, updateChecklistItem, batchSetChecklistStatus, showToast, currentUser } = useFacility();

  const [selectedCategory, setSelectedCategory] = useState<FacilityCategory | 'ALL'>('ALL');
  const [selectedCycle, setSelectedCycle] = useState<InspectionCycle>('일일');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNCHECKED' | 'NORMAL' | 'DEFECT'>('ALL');

  const filteredItems = checklistItems.filter(item => {
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchCycle = item.cycle === selectedCycle;
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchSearch =
      item.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchCycle && matchStatus && matchSearch;
  });

  const totalCycleCount = checklistItems.filter(i => i.cycle === selectedCycle).length;
  const checkedCycleCount = checklistItems.filter(i => i.cycle === selectedCycle && i.status !== 'UNCHECKED').length;
  const defectCycleCount = checklistItems.filter(i => i.cycle === selectedCycle && i.status === 'DEFECT').length;

  const handleBatchNormal = () => {
    batchSetChecklistStatus(selectedCategory, selectedCycle, 'NORMAL');
    confetti({
      particleCount: 60,
      spread: 50,
      origin: { y: 0.6 }
    });
  };

  const handleExportCSV = () => {
    const headers = ['구분,점검주기,설비명,위치,점검항목,판정기준,점검결과,계측값,비고,점검일시,점검자'];
    const rows = filteredItems.map(item => [
      `"${item.category}"`,
      `"${item.cycle}"`,
      `"${item.equipmentName}"`,
      `"${item.location}"`,
      `"${item.itemTitle.replace(/"/g, '""')}"`,
      `"${item.criteria.replace(/"/g, '""')}"`,
      `"${item.status === 'NORMAL' ? '정상(O)' : item.status === 'DEFECT' ? '이상(X)' : item.status === 'NA' ? '해당없음' : '미점검'}"`,
      `"${item.measuredValue || ''}"`,
      `"${item.notes || ''}"`,
      `"${item.checkedAt || ''}"`,
      `"${item.checkedBy || ''}"`
    ].join(','));

    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `국민체육센터_시설점검표_${selectedCycle}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('CSV 다운로드 완료', '점검 데이터가 엑셀 호환 CSV로 저장되었습니다.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-bold">
              디지털 점검표
            </span>
            <span className="text-xs text-slate-500">
              서면 수기 점검표 디지털화 및 실시간 동기화
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            기계·소방 시설 점검표 관리
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBatchNormal}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <CheckCheck className="w-4 h-4" />
            선택 조건 일괄 정상(O) 승인
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV 내보내기
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            인쇄
          </button>
        </div>
      </div>

      {/* Filter & Controls Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        {/* Row 1: Cycles & Categories */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Cycle Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['일일', '주간', '월간'] as InspectionCycle[]).map(cycle => (
              <button
                key={cycle}
                onClick={() => setSelectedCycle(cycle)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${selectedCycle === cycle ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {cycle} 점검 ({checklistItems.filter(i => i.cycle === cycle).length})
              </button>
            ))}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-lg border transition-all ${selectedCategory === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              전체
            </button>
            <button
              onClick={() => setSelectedCategory('기계')}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all ${selectedCategory === '기계' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              <Wrench className="w-3.5 h-3.5" />
              기계설비
            </button>
            <button
              onClick={() => setSelectedCategory('소방')}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all ${selectedCategory === '소방' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              <Flame className="w-3.5 h-3.5" />
              소방설비
            </button>
            <button
              onClick={() => setSelectedCategory('수질/환경')}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all ${selectedCategory === '수질/환경' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            >
              <Droplets className="w-3.5 h-3.5" />
              수질정화
            </button>
          </div>
        </div>

        {/* Row 2: Search & Status Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="점검 항목, 설비명, 위치 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
            <span className="text-slate-500 font-medium">상태:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500"
            >
              <option value="ALL">전체 보기</option>
              <option value="UNCHECKED">미점검만</option>
              <option value="NORMAL">정상(O)만</option>
              <option value="DEFECT">이상(X)만</option>
            </select>

            <div className="ml-auto sm:ml-2 text-xs text-slate-500 font-medium">
              진행: <strong className="text-blue-600">{checkedCycleCount}</strong> / {totalCycleCount} (
              {totalCycleCount > 0 ? Math.round((checkedCycleCount / totalCycleCount) * 100) : 0}%)
              {defectCycleCount > 0 && (
                <span className="ml-2 text-rose-600 font-bold">이상 {defectCycleCount}건</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                <th className="py-2.5 px-3">구분</th>
                <th className="py-2.5 px-3">대상 설비 / 위치</th>
                <th className="py-2.5 px-3 min-w-[200px]">점검 항목 및 판정 기준</th>
                <th className="py-2.5 px-3 min-w-[150px]">계측값 / 메모</th>
                <th className="py-2.5 px-3 text-center min-w-[160px]">점검 판정 (O / X / N/A)</th>
                <th className="py-2.5 px-3 min-w-[110px]">점검 일시/점검자</th>
                <th className="py-2.5 px-3 text-right">사진</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    일치하는 점검 항목이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${item.status === 'DEFECT' ? 'bg-rose-50/30' : ''}`}
                  >
                    {/* Category */}
                    <td className="py-2.5 px-3 align-top">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.category === '소방' ? 'bg-rose-50 text-rose-600' : item.category === '수질/환경' ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'}`}>
                        {item.category}
                      </span>
                    </td>

                    {/* Equipment & Location */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-900">{item.equipmentName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">📍 {item.location}</div>
                    </td>

                    {/* Item Title & Criteria */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-900 leading-snug">{item.itemTitle}</div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-start gap-1">
                        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{item.criteria}</span>
                      </div>
                    </td>

                    {/* Measurement & Notes */}
                    <td className="py-3.5 px-4 align-top space-y-1">
                      <input
                        type="text"
                        placeholder={item.targetValue ? `기준: ${item.targetValue}` : '수치/상태 입력'}
                        value={item.measuredValue || ''}
                        onChange={e => updateChecklistItem(item.id, { measuredValue: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden focus:border-blue-500"
                      />
                      {item.notes && (
                        <div className="text-[11px] text-slate-500 bg-slate-50 p-1 rounded">
                          메모: {item.notes}
                        </div>
                      )}
                    </td>

                    {/* Status Buttons */}
                    <td className="py-3.5 px-4 align-top text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => {
                            updateChecklistItem(item.id, { status: 'NORMAL' });
                            showToast('정상 처리', `'${item.itemTitle}' 항목이 정상 처리되었습니다.`, 'success');
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${item.status === 'NORMAL' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'}`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          정상 (O)
                        </button>
                        <button
                          onClick={() => {
                            updateChecklistItem(item.id, { status: 'DEFECT' });
                            onOpenReportDefect(item);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${item.status === 'DEFECT' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-700'}`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          이상 (X)
                        </button>
                        <button
                          onClick={() => updateChecklistItem(item.id, { status: 'NA' })}
                          className={`px-2 py-1 rounded-lg font-medium text-xs transition-all ${item.status === 'NA' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                          N/A
                        </button>
                      </div>
                    </td>

                    {/* Date & Inspector */}
                    <td className="py-3.5 px-4 align-top text-[11px] text-slate-500">
                      {item.checkedAt ? (
                        <div>
                          <div className="font-mono text-slate-700">{item.checkedAt}</div>
                          <div className="font-semibold text-slate-900 mt-0.5">{item.checkedBy}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">미점검</span>
                      )}
                    </td>

                    {/* Photo */}
                    <td className="py-3.5 px-4 align-top text-right">
                      {item.photoUrl ? (
                        <div className="relative inline-block w-9 h-9 rounded-lg overflow-hidden border border-slate-200">
                          <img src={item.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <label className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg inline-flex cursor-pointer transition-colors">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    updateChecklistItem(item.id, { photoUrl: reader.result });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

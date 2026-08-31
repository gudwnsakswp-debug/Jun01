import React, { useState } from 'react';
import { useFacility } from '../../context/FacilityContext';
import { AnomalyRecord, AnomalyStatus } from '../../types';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Wrench,
  Camera,
  Layers,
  Table as TableIcon,
  Search,
  Building,
  Plus,
  Volume2,
  DollarSign
} from 'lucide-react';
import { AnomalyResolutionModal } from '../common/AnomalyResolutionModal';

interface PCAnomalyManagerProps {
  onOpenNewAnomalyModal: () => void;
}

export const PCAnomalyManager: React.FC<PCAnomalyManagerProps> = ({
  onOpenNewAnomalyModal
}) => {
  const { anomalies, updateAnomalyStatus, resolveAnomaly, showToast } = useFacility();
  const [viewStyle, setViewStyle] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [resolvingAnomaly, setResolvingAnomaly] = useState<AnomalyRecord | null>(null);

  const filteredAnomalies = anomalies.filter(
    a =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const detectedList = filteredAnomalies.filter(a => a.status === 'DETECTED');
  const inProgressList = filteredAnomalies.filter(a => a.status === 'IN_PROGRESS');
  const resolvedList = filteredAnomalies.filter(a => a.status === 'RESOLVED');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: AnomalyStatus) => {
    e.preventDefault();
    const anomalyId = e.dataTransfer.getData('text/plain');
    if (anomalyId) {
      if (targetStatus === 'RESOLVED') {
        const target = anomalies.find(a => a.id === anomalyId);
        if (target) setResolvingAnomaly(target);
      } else {
        updateAnomalyStatus(anomalyId, targetStatus);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 text-xs font-bold">
              현장 이상 및 결함 조치
            </span>
            <span className="text-xs text-slate-500">
              이상 감지 → 조치 중 → 조치 완료(비용·자재·사진) 수명주기 관리
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            현장 결함 및 조치 이력 통합 관리
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Switcher */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setViewStyle('KANBAN')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${viewStyle === 'KANBAN' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Layers className="w-3.5 h-3.5" />
              칸반 보드
            </button>
            <button
              onClick={() => setViewStyle('TABLE')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${viewStyle === 'TABLE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              테이블 보기
            </button>
          </div>

          <button
            onClick={onOpenNewAnomalyModal}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            현장 이상 등록
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="설비명, 고장 부위, 이상 내용, 위치 검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-rose-500"
          />
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-4">
          <span>
            총 <strong>{anomalies.length}</strong>건 (미조치:{' '}
            <strong className="text-rose-600">
              {anomalies.filter(a => a.status !== 'RESOLVED').length}
            </strong>
            건)
          </span>
        </div>
      </div>

      {/* Kanban View */}
      {viewStyle === 'KANBAN' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column 1: DETECTED */}
          <div
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, 'DETECTED')}
            className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col min-h-[480px]"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">이상 감지 / 접수</h3>
              </div>
              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold text-[10px]">
                {detectedList.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar">
              {detectedList.map(anom => (
                <div
                  key={anom.id}
                  draggable
                  onDragStart={e => e.dataTransfer.setData('text/plain', anom.id)}
                  className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2 cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${anom.severity === '긴급' ? 'bg-rose-600 text-white' : anom.severity === '중요' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-white'}`}>
                      {anom.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{anom.reportedAt}</span>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] font-bold text-blue-600">
                      {anom.equipmentCode}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs mt-0.5">{anom.equipmentName}</h4>
                    <p className="text-xs font-medium text-slate-700 mt-1">{anom.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {anom.description}
                    </p>
                  </div>

                  {anom.photoUrl && (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-200">
                      <img src={anom.photoUrl} alt="Evidence" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">📍 {anom.location}</span>
                    <button
                      onClick={() => updateAnomalyStatus(anom.id, 'IN_PROGRESS')}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-bold text-[11px]"
                    >
                      조치 시작 →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: IN_PROGRESS */}
          <div
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, 'IN_PROGRESS')}
            className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col min-h-[480px]"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">조치 진행 중</h3>
              </div>
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold text-[10px]">
                {inProgressList.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar">
              {inProgressList.map(anom => (
                <div
                  key={anom.id}
                  draggable
                  onDragStart={e => e.dataTransfer.setData('text/plain', anom.id)}
                  className="bg-white p-3 rounded-lg border border-blue-200 shadow-xs hover:border-blue-300 transition-all space-y-2 cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${anom.severity === '긴급' ? 'bg-rose-600 text-white' : anom.severity === '중요' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-white'}`}>
                      {anom.severity}
                    </span>
                    <span className="text-[10px] text-blue-600 font-bold">부품 수급/작업 중</span>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] font-bold text-blue-600">
                      {anom.equipmentCode}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs mt-0.5">{anom.equipmentName}</h4>
                    <p className="text-xs font-semibold text-slate-800 mt-1">{anom.title}</p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {anom.description}
                    </p>
                  </div>

                  {anom.audioNote && (
                    <div className="bg-blue-50 p-2 rounded-lg text-[11px] text-blue-800 flex items-start gap-1.5 border border-blue-100">
                      <Volume2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="italic leading-tight">{anom.audioNote}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">담당: {anom.reportedBy}</span>
                    <button
                      onClick={() => setResolvingAnomaly(anom)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      조치 결과 등록
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: RESOLVED */}
          <div
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, 'RESOLVED')}
            className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col min-h-[480px]"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">조치 완료 (이력 동기화)</h3>
              </div>
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                {resolvedList.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar">
              {resolvedList.map(anom => (
                <div
                  key={anom.id}
                  className="bg-white p-3 rounded-lg border border-emerald-200 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                      완료 ({anom.resolution?.repairType})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {anom.resolution?.resolvedAt}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{anom.equipmentName}</h4>
                    <p className="text-xs text-slate-700 font-medium mt-0.5">{anom.title}</p>
                  </div>

                  {anom.resolution && (
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] space-y-1 text-slate-600">
                      <div>
                        <strong>조치내용:</strong> {anom.resolution.description}
                      </div>
                      <div>
                        <strong>교체자재:</strong> {anom.resolution.partsReplaced}
                      </div>
                      <div className="text-emerald-700 font-bold pt-0.5 flex justify-between">
                        <span>비용: {anom.resolution.cost.toLocaleString()}원</span>
                        <span>조치자: {anom.resolution.resolvedBy}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <th className="py-2.5 px-3">상태</th>
                  <th className="py-2.5 px-3">긴급도</th>
                  <th className="py-2.5 px-3">설비명 / 위치</th>
                  <th className="py-2.5 px-3 min-w-[220px]">이상 내용</th>
                  <th className="py-2.5 px-3 min-w-[200px]">조치 결과 및 비용</th>
                  <th className="py-2.5 px-3">신고일시/신고자</th>
                  <th className="py-2.5 px-3 text-right">조치 관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAnomalies.map(anom => (
                  <tr key={anom.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${anom.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' : anom.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'}`}>
                        {anom.status === 'RESOLVED' ? '조치 완료' : anom.status === 'IN_PROGRESS' ? '조치 중' : '이상 감지'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${anom.severity === '긴급' ? 'bg-rose-600 text-white' : anom.severity === '중요' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-white'}`}>
                        {anom.severity}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{anom.equipmentName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">📍 {anom.location}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-800">{anom.title}</div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{anom.description}</p>
                    </td>

                    <td className="py-2.5 px-3 text-[11px]">
                      {anom.resolution ? (
                        <div>
                          <div className="text-slate-800 font-medium">{anom.resolution.description}</div>
                          <div className="text-emerald-700 font-bold mt-0.5">
                            {anom.resolution.cost.toLocaleString()}원 ({anom.resolution.partsReplaced})
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">미완료</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-[11px] text-slate-500">
                      <div>{anom.reportedAt}</div>
                      <div className="font-semibold text-slate-800 mt-0.5">{anom.reportedBy}</div>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {anom.status !== 'RESOLVED' ? (
                        <button
                          onClick={() => setResolvingAnomaly(anom)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs"
                        >
                          조치완료 등록
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-xs">완료됨</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {resolvingAnomaly && (
        <AnomalyResolutionModal
          anomaly={resolvingAnomaly}
          onClose={() => setResolvingAnomaly(null)}
          onResolve={(data) => {
            resolveAnomaly(resolvingAnomaly.id, data);
            setResolvingAnomaly(null);
          }}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useFacility } from '../../context/FacilityContext';
import { StatutoryInspection } from '../../types';
import {
  Calendar,
  ShieldAlert,
  Send,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Clock,
  Plus,
  ExternalLink,
  Phone,
  FileCheck
} from 'lucide-react';
import { KakaoAlimtalkModal } from '../common/KakaoAlimtalkModal';

export const PCStatutoryManager: React.FC = () => {
  const {
    statutoryInspections,
    updateStatutoryInspection,
    attachStatutoryReport,
    sendDDayNotification,
    showToast
  } = useFacility();

  const [selectedForAlimtalk, setSelectedForAlimtalk] = useState<StatutoryInspection | null>(null);
  const [selectedDDayType, setSelectedDDayType] = useState<'d30' | 'd14' | 'd7' | 'd1'>('d7');
  const [uploadingInspectionId, setUploadingInspectionId] = useState<string | null>(null);

  // Upload Report State
  const [reportFileName, setReportFileName] = useState('');
  const [reportSummary, setReportSummary] = useState('');
  const [findingsCount, setFindingsCount] = useState(0);
  const [actionRequiredCount, setActionRequiredCount] = useState(0);

  const handleOpenUploadModal = (stat: StatutoryInspection) => {
    setUploadingInspectionId(stat.id);
    setReportFileName(`${new Date().getFullYear()}_${stat.title}_결과진단서.pdf`);
    setReportSummary('점검 결과 전반 적합 판정. 세부 지적사항 없음.');
    setFindingsCount(0);
    setActionRequiredCount(0);
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingInspectionId) return;

    attachStatutoryReport(uploadingInspectionId, {
      fileName: reportFileName || '법정점검_결과보고서.pdf',
      fileSize: '3.4 MB',
      summary: reportSummary,
      findingsCount: Number(findingsCount) || 0,
      actionRequiredCount: Number(actionRequiredCount) || 0
    });
    setUploadingInspectionId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs font-bold">
              법정 의무 관리
            </span>
            <span className="text-xs text-slate-500">
              소방시설법, 기계설비법, 체육시설법 등 법정 검사 누락 제로화
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            법정 점검 DB & D-Day 알림 엔진
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>4단계 사전 알림 가동 중 (D-30, D-14, D-7, D-1)</span>
        </div>
      </div>

      {/* Statutory Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statutoryInspections.map(stat => {
          const isUrgent = stat.dDay <= 14 && stat.status !== 'COMPLETED';

          return (
            <div
              key={stat.id}
              className={`bg-white rounded-xl p-4 border transition-all shadow-sm flex flex-col justify-between ${isUrgent ? 'border-amber-300 ring-1 ring-amber-300' : 'border-slate-200'}`}
            >
              <div className="space-y-2.5">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${stat.category === '소방' ? 'bg-rose-50 text-rose-600' : stat.category === '수질/환경' ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'}`}>
                      {stat.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{stat.cycle}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${stat.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : isUrgent ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {stat.status === 'COMPLETED' ? '완료됨' : `D-${stat.dDay}일`}
                  </span>
                </div>

                {/* Title & Law */}
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {stat.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <span className="font-medium text-slate-700">관련 법령:</span> {stat.lawBasis}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    <span className="font-medium text-slate-700">대상 시설:</span> {stat.targetFacility}
                  </p>
                </div>

                {/* Dates & Contractor */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">최근 점검일:</span>
                    <span className="font-mono font-medium">{stat.lastInspectionDate}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">차기 점검 기한:</span>
                    <span className="font-mono font-bold text-rose-600">{stat.nextDueDate}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-400">점검 주체:</span>
                    <span className="font-semibold text-slate-800">{stat.contractorName || stat.inspectorType}</span>
                  </div>
                  {stat.contractorContact && (
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> 연락처:
                      </span>
                      <span>{stat.contractorContact}</span>
                    </div>
                  )}
                </div>

                {/* Attached External Contractor Report if available */}
                {stat.reportAttached ? (
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1 text-xs">
                    <div className="flex items-center justify-between text-emerald-800 font-bold">
                      <div className="flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span>{stat.reportAttached.fileName}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600">{stat.reportAttached.fileSize}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 pt-0.5 line-clamp-2">
                      <strong>진단 요약:</strong> {stat.reportAttached.summary}
                    </p>
                    <div className="text-[10px] text-slate-400 pt-0.5">
                      업로드: {stat.reportAttached.uploadedAt} (지적사항: {stat.reportAttached.findingsCount}건)
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px]">외주 진단 보고서 미등록 상태</span>
                    <button
                      onClick={() => handleOpenUploadModal(stat)}
                      className="px-2 py-0.5 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 rounded text-xs font-bold flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      보고서 첨부
                    </button>
                  </div>
                )}
              </div>

              {/* D-Day Notification Status & Action Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-slate-500">알림 발송 현황:</span>
                  <div className="flex items-center gap-1 text-[10px]">
                    {(['d30', 'd14', 'd7', 'd1'] as const).map(dType => {
                      const sent = stat.notificationsSent[dType];
                      const dNumber = dType === 'd30' ? '30' : dType === 'd14' ? '14' : dType === 'd7' ? '7' : '1';
                      return (
                        <span
                          key={dType}
                          className={`px-1.5 py-0.5 rounded font-bold ${sent ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-400'}`}
                        >
                          D-{dNumber} {sent ? '✓' : ''}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedForAlimtalk(stat);
                      setSelectedDDayType(stat.dDay <= 7 ? 'd7' : 'd14');
                    }}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    알림톡 발송
                  </button>

                  <button
                    onClick={() => handleOpenUploadModal(stat)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    보고서 등록
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* External Report Upload Modal */}
      {uploadingInspectionId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Upload className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">외주 전문업체 점검 보고서 등록</h3>
                  <p className="text-[10px] text-slate-500">외부 점검 결과 성적서 및 지적사항 기록</p>
                </div>
              </div>
              <button
                onClick={() => setUploadingInspectionId(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleSaveReport} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">보고서 파일명 *</label>
                <input
                  type="text"
                  value={reportFileName}
                  onChange={e => setReportFileName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">진단 및 종합 소견 요약 *</label>
                <textarea
                  rows={3}
                  value={reportSummary}
                  onChange={e => setReportSummary(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">지적 사항 건수</label>
                  <input
                    type="number"
                    value={findingsCount}
                    onChange={e => setFindingsCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">시정 조치 필요 건수</label>
                  <input
                    type="number"
                    value={actionRequiredCount}
                    onChange={e => setActionRequiredCount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadingInspectionId(null)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg font-medium text-xs"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  보고서 저장 및 점검 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kakao Alimtalk Preview Modal */}
      {selectedForAlimtalk && (
        <KakaoAlimtalkModal
          inspection={selectedForAlimtalk}
          dDayType={selectedDDayType}
          onClose={() => setSelectedForAlimtalk(null)}
          onConfirmSend={() => {
            sendDDayNotification(selectedForAlimtalk.id, selectedDDayType);
          }}
        />
      )}
    </div>
  );
};

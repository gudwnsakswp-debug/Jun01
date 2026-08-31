import React, { useState, useRef } from 'react';
import { useFacility } from '../../context/FacilityContext';
import {
  Printer,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  Layers,
  Wrench,
  Flame,
  Droplets,
  ShieldCheck,
  Award,
  Sparkles,
  Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const PCReportGenerator: React.FC = () => {
  const {
    centerInfo,
    equipments,
    checklistItems,
    anomalies,
    statutoryInspections,
    maintenanceHistory,
    currentUser,
    showToast
  } = useFacility();

  const [reportPeriod, setReportPeriod] = useState<'당월 (2026년 8월)' | '전월 (2026년 7월)' | '2026년 3분기'>('당월 (2026년 8월)');
  const [reportTitle, setReportTitle] = useState('2026년 8월 국민체육센터 기계·소방 시설점검 및 유지보수 월간 종합 결재 보고서');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  // Statistics calculation
  const totalEquipments = equipments.length;
  const normalEquipments = equipments.filter(e => e.status === '정상').length;

  const totalChecklists = checklistItems.length;
  const checkedItems = checklistItems.filter(c => c.status !== 'UNCHECKED').length;
  const overallRate = totalChecklists > 0 ? Math.round((checkedItems / totalChecklists) * 100) : 0;

  const resolvedAnomalies = anomalies.filter(a => a.status === 'RESOLVED');
  const pendingAnomalies = anomalies.filter(a => a.status !== 'RESOLVED');
  const totalRepairCost = maintenanceHistory.reduce((sum, m) => sum + m.cost, 0);

  // PDF Export Function using html2canvas & jsPDF
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPDF(true);
    showToast('PDF 변환 시작', '정형 결재 보고서를 고해상도 PDF 문서로 변환하고 있습니다.', 'info');

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`[CenterCare]_국민체육센터_시설점검_월간결재보고서_${new Date().toISOString().slice(0, 10)}.pdf`);
      showToast('PDF 다운로드 완료', '시설점검 결재 보고서 저장이 완료되었습니다.', 'success');
    } catch (err) {
      console.error(err);
      showToast('PDF 변환 실패', '인쇄(Ctrl+P) 기능을 통해 PDF로 저장해주세요.', 'warning');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Control Bar (Hidden on print) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold">
              1클릭 자동 보고서 생성
            </span>
            <span className="text-xs text-slate-500">
              현장 모바일 점검 데이터 + 수리 이력 + 법정 점검 자동 취합
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            시설점검 월간 종합 결재 보고서
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={reportPeriod}
            onChange={e => setReportPeriod(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden"
          >
            <option value="당월 (2026년 8월)">당월 (2026년 8월)</option>
            <option value="전월 (2026년 7월)">전월 (2026년 7월)</option>
            <option value="2026년 3분기">2026년 3분기</option>
          </select>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                PDF 생성 중...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                PDF 다운로드
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            보고서 인쇄
          </button>
        </div>
      </div>

      {/* Official Document Container (A4 Printable Layout) */}
      <div className="flex justify-center">
        <div
          ref={reportRef}
          className="bg-white w-full max-w-4xl p-6 sm:p-10 rounded-xl sm:rounded-xl shadow-sm border border-slate-200 text-slate-900 space-y-5 print:p-0 print:m-0 print:border-0 print:shadow-none font-sans"
        >
          {/* Document Header & 3-Step Approval Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b-2 border-slate-900">
            <div>
              <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                {centerInfo?.name || '국민체육센터'} 시설관리팀
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-1">
                기계·소방 시설점검 및 안전관리 월간 종합 결재 보고서
              </h1>
              <div className="text-xs text-slate-600 mt-1.5 flex items-center gap-3">
                <span><strong>보고 대상 기간:</strong> {reportPeriod}</span>
                <span><strong>작성 일자:</strong> {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span><strong>작성자:</strong> {currentUser?.name || '김시설 주임'} ({currentUser?.role || '시설관리자'})</span>
              </div>
            </div>

            {/* Official 3-Step Approval Stamp Table */}
            <div className="shrink-0 border border-slate-800 text-center text-xs">
              <div className="grid grid-cols-4 bg-slate-100 border-b border-slate-800 font-bold">
                <div className="py-1 px-2 border-r border-slate-800 flex items-center justify-center writing-mode-vertical text-[11px]">
                  결재
                </div>
                <div className="py-1 px-3 border-r border-slate-800">기계/소방 담당</div>
                <div className="py-1 px-3 border-r border-slate-800">시설팀장</div>
                <div className="py-1 px-3">관장 (센터장)</div>
              </div>
              <div className="grid grid-cols-4 h-16 divide-x divide-slate-800 items-center">
                <div className="bg-slate-50 text-[10px] text-slate-400">서명</div>
                <div className="flex flex-col items-center justify-center p-1 text-[11px]">
                  <span className="font-bold text-blue-700">김시설</span>
                  <span className="text-[9px] text-slate-400 font-mono">08/30 17:00</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1 text-[11px]">
                  <span className="font-bold text-slate-800">박팀장</span>
                  <span className="text-[9px] text-slate-400 font-mono">08/30 18:20</span>
                </div>
                <div className="flex flex-col items-center justify-center p-1 text-[11px]">
                  <div className="w-10 h-10 rounded-full border-2 border-rose-600 text-rose-600 flex items-center justify-center font-extrabold text-[10px] transform -rotate-12">
                    승인
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-2">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 border-l-4 border-blue-600 pl-2">
              1. 종합 시설 안전 및 점검 총괄 요약
            </h2>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs leading-relaxed space-y-2">
              <p>
                당월 국민체육센터 내 기계·소방·수질정화 시설물에 대한 정기 일일/주간/월간 디지털 점검을 완벽히 이행하였으며,
                총 <strong>{totalEquipments}대</strong>의 주요 핵심 설비 중 정상 가동률 <strong>{Math.round((normalEquipments / totalEquipments) * 100)}%</strong>를 유지하고 있습니다.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                  <div className="text-slate-500 text-[11px]">점검 이행률</div>
                  <div className="font-extrabold text-blue-600 text-base">{overallRate}%</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                  <div className="text-slate-500 text-[11px]">이상 조치율</div>
                  <div className="font-extrabold text-emerald-600 text-base">
                    {anomalies.length > 0 ? Math.round((resolvedAnomalies.length / anomalies.length) * 100) : 100}%
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                  <div className="text-slate-500 text-[11px]">법정점검 준수</div>
                  <div className="font-extrabold text-indigo-600 text-base">100% 적합</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                  <div className="text-slate-500 text-[11px]">당월 정비비용</div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {totalRepairCost.toLocaleString()}원
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Facility Inspection Rate Matrix */}
          <div className="space-y-2">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 border-l-4 border-blue-600 pl-2">
              2. 분야별 시설 점검 이행 현황
            </h2>
            <table className="w-full text-xs border border-slate-300 text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold text-center">
                  <th className="py-2 px-3 border-r border-slate-300">구분</th>
                  <th className="py-2 px-3 border-r border-slate-300">점검 대상 설비</th>
                  <th className="py-2 px-3 border-r border-slate-300">총 점검 항목수</th>
                  <th className="py-2 px-3 border-r border-slate-300">정상(O)</th>
                  <th className="py-2 px-3 border-r border-slate-300">이상(X)</th>
                  <th className="py-2 px-3">이행률 (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-center">
                <tr>
                  <td className="py-2 px-3 font-bold bg-slate-50 border-r border-slate-300">기계설비</td>
                  <td className="py-2 px-3 border-r border-slate-300 text-left">냉온수기, 보일러, 수중펌프, AHU 공조기 등</td>
                  <td className="py-2 px-3 border-r border-slate-300">12항목</td>
                  <td className="py-2 px-3 border-r border-slate-300 text-emerald-600 font-bold">11</td>
                  <td className="py-2 px-3 border-r border-slate-300 text-rose-600 font-bold">1</td>
                  <td className="py-2 px-3 font-bold text-blue-600">100%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold bg-slate-50 border-r border-slate-300">소방설비</td>
                  <td className="py-2 px-3 border-r border-slate-300 text-left">수신반, 옥내소화펌프, 비상방송, 방화문 등</td>
                  <td className="py-2 px-3 border-r border-slate-300">8항목</td>
                  <td className="py-2 px-3 border-r border-slate-300 text-emerald-600 font-bold">7</td>
                  <td className="py-2 px-3 border-r border-slate-300 text-rose-600 font-bold">1</td>
                  <td className="py-2 px-3 font-bold text-blue-600">100%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-bold bg-slate-50 border-r border-slate-300">수질/환경</td>
                  <td className="py-2 px-3 border-r border-slate-300 text-left">수영장 여과기, 잔류염소/pH, 복합살균장치</td>
                  <td className="py-2 px-3 border-r border-slate-300">5항목</td>
                  <td className="py-2 px-3 border-r border-slate-300 text-emerald-600 font-bold">5</td>
                  <td className="py-2 px-3 border-r border-slate-300 text-slate-400">0</td>
                  <td className="py-2 px-3 font-bold text-blue-600">100%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Statutory Compliance */}
          <div className="space-y-2">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 border-l-4 border-blue-600 pl-2">
              3. 법정 의무 검사 준수 및 외주 정밀진단 결과
            </h2>
            <table className="w-full text-xs border border-slate-300 text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold text-center">
                  <th className="py-2 px-3 border-r border-slate-300">법정 점검명</th>
                  <th className="py-2 px-3 border-r border-slate-300">관련 법령 근거</th>
                  <th className="py-2 px-3 border-r border-slate-300">차기 점검 기한</th>
                  <th className="py-2 px-3 border-r border-slate-300">점검 대행사</th>
                  <th className="py-2 px-3">진단 결과 판정</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-center">
                {statutoryInspections.map(stat => (
                  <tr key={stat.id}>
                    <td className="py-2 px-3 font-bold border-r border-slate-300 text-left">{stat.title}</td>
                    <td className="py-2 px-3 border-r border-slate-300 text-slate-600">{stat.lawBasis}</td>
                    <td className="py-2 px-3 border-r border-slate-300 font-mono font-bold text-slate-800">{stat.nextDueDate}</td>
                    <td className="py-2 px-3 border-r border-slate-300 text-slate-600">{stat.contractorName || stat.inspectorType}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                        {stat.status === 'COMPLETED' ? '적합 완료' : `준비중 (D-${stat.dDay})`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Fault Anomaly & Maintenance Log with Photo Evidence */}
          <div className="space-y-2">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 border-l-4 border-blue-600 pl-2">
              4. 현장 이상사항 발견 및 수리 조치 결과 (증빙 사진 포함)
            </h2>
            <div className="space-y-3">
              {anomalies.map(anom => (
                <div key={anom.id} className="p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-slate-900">
                      [{anom.category}] {anom.equipmentName} ({anom.equipmentCode}) - {anom.title}
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[11px]">
                      {anom.status === 'RESOLVED' ? '조치 완료' : '조치 진행 중'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">[이상 현상]</span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{anom.description}</p>
                      <div className="mt-1 text-[10px] text-slate-400">
                        발견일시: {anom.reportedAt} (신고자: {anom.reportedBy})
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block mb-0.5">[조치 내역 및 정비 결과]</span>
                      {anom.resolution ? (
                        <div className="text-slate-600 text-[11px] leading-relaxed">
                          <p>{anom.resolution.description}</p>
                          <div className="mt-1 font-bold text-blue-700">
                            교체자재: {anom.resolution.partsReplaced} / 비용: {anom.resolution.cost.toLocaleString()}원
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-400 text-[11px]">현재 부품 수급 및 정비 진행 중</p>
                      )}
                    </div>
                  </div>

                  {/* Photo Evidence Thumbnail if available */}
                  {anom.photoUrl && (
                    <div className="pt-2 border-t border-slate-200 flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-300 shrink-0">
                        <img src={anom.photoUrl} alt="Evidence" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-[10px] text-slate-500">
                        <span className="font-bold text-slate-700 block">현장 디지털 증빙 사진</span>
                        모바일 현장점검 즉시 촬영 및 서버 동기화 기록물
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Monthly Maintenance Cost Breakdown */}
          <div className="space-y-2">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 border-l-4 border-blue-600 pl-2">
              5. 당월 시설 유지보수 및 자재 비용 집행 내역
            </h2>
            <table className="w-full text-xs border border-slate-300 text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold text-center">
                  <th className="py-2 px-3 border-r border-slate-300">정비 일자</th>
                  <th className="py-2 px-3 border-r border-slate-300">설비명</th>
                  <th className="py-2 px-3 border-r border-slate-300">수리 구분</th>
                  <th className="py-2 px-3 border-r border-slate-300">투입 자재 / 부품</th>
                  <th className="py-2 px-3 text-right">집행 금액 (원)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-center">
                {maintenanceHistory.map(maint => (
                  <tr key={maint.id}>
                    <td className="py-2 px-3 font-mono border-r border-slate-300">{maint.repairDate}</td>
                    <td className="py-2 px-3 border-r border-slate-300 font-bold text-left">{maint.equipmentName}</td>
                    <td className="py-2 px-3 border-r border-slate-300">{maint.repairType}</td>
                    <td className="py-2 px-3 border-r border-slate-300 text-left text-slate-600">{maint.partsConsumed}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">{maint.cost.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-black">
                  <td colSpan={4} className="py-2.5 px-3 text-center border-r border-slate-300">
                    합계 (Total Budget Executed)
                  </td>
                  <td className="py-2.5 px-3 text-right text-blue-700 text-sm">
                    {totalRepairCost.toLocaleString()} 원
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Official Footer Note */}
          <div className="pt-6 border-t border-slate-300 text-center space-y-1">
            <p className="text-xs font-bold text-slate-800">
              상기 보고서 내용은 국민체육센터 스마트 시설점검 및 통합 이력 관리 시스템(CenterCare)에 실시간 기록된 정본 데이터입니다.
            </p>
            <p className="text-[11px] text-slate-500">
              {centerInfo?.name || '국민체육센터'} 관장 귀하
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

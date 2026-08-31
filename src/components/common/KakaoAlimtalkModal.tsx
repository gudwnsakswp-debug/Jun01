import React from 'react';
import { StatutoryInspection } from '../../types';
import { X, Send, BellRing, Smartphone, CheckCheck } from 'lucide-react';

interface KakaoAlimtalkModalProps {
  inspection: StatutoryInspection | null;
  dDayType: 'd30' | 'd14' | 'd7' | 'd1';
  onClose: () => void;
  onConfirmSend: () => void;
}

export const KakaoAlimtalkModal: React.FC<KakaoAlimtalkModalProps> = ({
  inspection,
  dDayType,
  onClose,
  onConfirmSend
}) => {
  if (!inspection) return null;

  const dDayNumber = dDayType === 'd30' ? 30 : dDayType === 'd14' ? 14 : dDayType === 'd7' ? 7 : 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FEE500] text-[#3c1e1e] flex items-center justify-center font-black text-xs shadow-xs">
              TALK
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">카카오 알림톡 & FCM 푸시 발송</h3>
              <p className="text-[11px] text-slate-500">법정점검 D-{dDayNumber} 사전 알림 서비스</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Container */}
        <div className="p-5 bg-slate-100 space-y-3">
          {/* FCM Push Notification Preview */}
          <div className="bg-white/95 rounded-xl p-3 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <div className="flex items-center gap-1 font-semibold text-slate-700">
                <BellRing className="w-3 h-3 text-blue-600" />
                CenterCare 시설안전
              </div>
              <span>방금 전</span>
            </div>
            <div className="text-xs font-bold text-slate-800">
              [법정점검 D-{dDayNumber} 알림] {inspection.title}
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
              예정일({inspection.nextDueDate})까지 {dDayNumber}일 남았습니다. 외주업체 일정 확정 및 사전점검표를 준비해주세요.
            </p>
          </div>

          {/* Kakao Alimtalk Card Preview */}
          <div className="bg-[#FFF9CC] border border-[#F5E080] rounded-xl p-4 shadow-sm text-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0D870]">
              <span className="text-[11px] font-bold text-[#553b1b] bg-[#FFE87A] px-2 py-0.5 rounded">
                [알림톡] 법정의무점검 도래 안내
              </span>
              <span className="text-[10px] text-[#8a6d3b]">국민체육센터 시설팀</span>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <p className="font-medium leading-relaxed">
                안녕하세요, <strong>국민체육센터 시설안전관리팀</strong>입니다.<br />
                귀 센터의 관련 법령에 따른 법정의무점검 예정일이 <strong>D-{dDayNumber}일</strong> 앞으로 다가왔습니다.
              </p>

              <div className="bg-white/80 rounded-lg p-2.5 space-y-1 text-[11px] border border-[#F2DE82]">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">점검 항목:</span>
                  <span className="font-bold text-slate-900">{inspection.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">관련 법령:</span>
                  <span className="text-slate-700">{inspection.lawBasis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">점검 마감일:</span>
                  <span className="font-bold text-rose-600">{inspection.nextDueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">담당/대행사:</span>
                  <span className="text-slate-700">{inspection.contractorName || inspection.inspectorType}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#785b28] pt-1">
                ⚠️ 법정 기한 내 미실시 시 과태료 및 행정처분 대상이 될 수 있으니 기한 준수 바랍니다.
              </p>
            </div>

            {/* Kakao Action Buttons */}
            <div className="mt-3 pt-2 border-t border-[#F0D870] flex flex-col gap-1.5">
              <div className="w-full py-1.5 bg-[#FEE500] hover:bg-[#FDD835] text-[#3c1e1e] rounded-lg text-center font-bold text-xs shadow-xs cursor-pointer">
                점검 일정 확인 및 보고서 첨부
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5" />
            수신: 시설담당자 외 2인
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-100 transition-colors"
            >
              닫기
            </button>
            <button
              onClick={() => {
                onConfirmSend();
                onClose();
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              즉시 발송하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

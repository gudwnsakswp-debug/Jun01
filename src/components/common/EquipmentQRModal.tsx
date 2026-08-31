import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Equipment } from '../../types';
import { X, Printer, Download, Sparkles, Building2, ShieldCheck } from 'lucide-react';

interface EquipmentQRModalProps {
  equipment: Equipment | null;
  onClose: () => void;
  onScanThis?: (eq: Equipment) => void;
}

export const EquipmentQRModal: React.FC<EquipmentQRModalProps> = ({
  equipment,
  onClose,
  onScanThis
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!equipment) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSVG = () => {
    const svgElement = printRef.current?.querySelector('svg');
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_${equipment.code}_${equipment.name}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              QR
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">설비 표준 QR 코드 명판</h3>
              <p className="text-xs text-slate-500">현장 부착용 표준 규격 태그</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Area */}
        <div className="p-6">
          <div
            ref={printRef}
            className="p-6 border-2 border-slate-800 rounded-xl bg-white shadow-sm flex flex-col items-center text-center relative"
          >
            {/* Header in Badge */}
            <div className="w-full pb-3 mb-4 border-b-2 border-slate-800 flex items-center justify-between text-left">
              <div>
                <div className="text-[10px] font-extrabold tracking-wider text-blue-700 uppercase flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  국민체육센터 스마트시설관리
                </div>
                <div className="text-sm font-black text-slate-900 tracking-tight">
                  CenterCare 설비 관리표
                </div>
              </div>
              <span className={`px-2 py-0.5 text-xs font-bold rounded ${equipment.category === '소방' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-blue-100 text-blue-800 border border-blue-300'}`}>
                {equipment.category}설비
              </span>
            </div>

            {/* QR Code SVG */}
            <div className="p-3 bg-white border border-slate-300 rounded-lg shadow-inner my-1">
              <QRCodeSVG
                value={equipment.qrPayload}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="mt-3 w-full">
              <div className="text-xs font-mono font-bold text-blue-600 bg-blue-50 py-1 px-2 rounded border border-blue-200 inline-block">
                {equipment.code}
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                {equipment.name}
              </h4>
              <p className="text-xs text-slate-600 mt-1 flex items-center justify-center gap-1">
                📍 {equipment.location}
              </p>
            </div>

            {/* Specs Mini Table */}
            <div className="w-full mt-4 pt-3 border-t border-dashed border-slate-300 text-left text-[11px] grid grid-cols-2 gap-x-2 gap-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-lg">
              <div>
                <span className="font-semibold text-slate-800">제조사:</span> {equipment.manufacturer}
              </div>
              <div>
                <span className="font-semibold text-slate-800">설치일:</span> {equipment.installedDate}
              </div>
              <div className="col-span-2 truncate">
                <span className="font-semibold text-slate-800">모델명:</span> {equipment.modelNumber}
              </div>
              <div className="col-span-2 text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                현장에서 모바일 스마트폰으로 스캔하여 점검 및 수리이력 확인
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          {onScanThis ? (
            <button
              onClick={() => {
                onScanThis(equipment);
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/20"
            >
              <Sparkles className="w-4 h-4" />
              이 설비로 현장점검 시뮬레이션
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSVG}
              className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              SVG 저장
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              명판 인쇄
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

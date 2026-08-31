import React, { useState, useEffect, useRef } from 'react';
import { useFacility } from '../../context/FacilityContext';
import { Equipment } from '../../types';
import { Camera, X, CheckCircle, RefreshCw, Zap, Search, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (equipment: Equipment) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const { equipments } = useFacility();
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedDemoId, setSelectedDemoId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError('이 브라우저는 카메라 접근을 지원하지 않습니다.');
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('카메라 권한이 비활성화되어 있거나 장치가 없습니다. 아래 설비 목록에서 직접 선택하여 스캔을 시뮬레이션할 수 있습니다.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  if (!isOpen) return null;

  const handleSelectEquipment = (eq: Equipment) => {
    stopCamera();
    onScanSuccess(eq);
    onClose();
  };

  const filteredEquipments = equipments.filter(
    eq =>
      eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">현장 설비 QR 코드 스캔</h3>
              <p className="text-xs text-slate-400">설비 명판의 QR코드를 사각형 영역에 맞춰주세요</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder */}
        <div className="relative aspect-square max-h-72 sm:max-h-80 w-full bg-black overflow-hidden flex items-center justify-center">
          {cameraActive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-6 text-center text-slate-400 flex flex-col items-center">
              <Camera className="w-12 h-12 text-slate-600 mb-2 stroke-[1.5]" />
              <p className="text-xs max-w-xs leading-relaxed text-slate-400">
                {cameraError || '카메라를 준비 중입니다...'}
              </p>
              <button
                onClick={startCamera}
                className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-200 flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                카메라 다시 시도
              </button>
            </div>
          )}

          {/* Scanner Overlay Box */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
            <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-dashed border-blue-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />

              {/* Scanning laser line animation */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_8px_#60a5fa]" />
            </div>
          </div>

          <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
            <span className="px-3 py-1 bg-black/70 backdrop-blur-xs text-[11px] text-blue-300 rounded-full border border-blue-500/30">
              CenterCare QR 자동 인식 중
            </span>
          </div>
        </div>

        {/* Quick Simulator Picker for Instant Demo */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              빠른 현장 설비 선택 (스캔 시뮬레이션)
            </div>
            <span className="text-[11px] text-slate-400">{equipments.length}개 설비</span>
          </div>

          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="설비명, 코드, 위치 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
            {filteredEquipments.map(eq => (
              <button
                key={eq.id}
                onClick={() => handleSelectEquipment(eq)}
                className="w-full text-left p-2 rounded-xl bg-slate-800/80 hover:bg-blue-900/40 hover:border-blue-500 border border-slate-700/60 transition-all flex items-center justify-between group"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${eq.category === '소방' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-blue-950 text-blue-300 border border-blue-800'}`}>
                      {eq.category}
                    </span>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-blue-300 truncate">
                      {eq.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-slate-400">{eq.code}</span>
                    <span>•</span>
                    <span className="truncate">{eq.location}</span>
                  </div>
                </div>
                <div className="px-2 py-1 bg-blue-600/30 group-hover:bg-blue-600 text-blue-300 group-hover:text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors">
                  선택
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useFacility } from '../../context/FacilityContext';
import { Equipment, MaintenanceHistory, RepairType, FacilityCategory } from '../../types';
import {
  Wrench,
  QrCode,
  Plus,
  Search,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  History,
  AlertCircle,
  Building,
  ShieldCheck,
  Tag,
  Check
} from 'lucide-react';
import { EquipmentQRModal } from '../common/EquipmentQRModal';

export const PCMaintenanceDB: React.FC = () => {
  const {
    equipments,
    maintenanceHistory,
    addEquipment,
    addMaintenanceRecord,
    showToast
  } = useFacility();

  const [activeSubTab, setActiveSubTab] = useState<'HISTORY' | 'EQUIPMENTS'>('HISTORY');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipmentForQR, setSelectedEquipmentForQR] = useState<Equipment | null>(null);

  // Modals
  const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);
  const [isAddMaintModalOpen, setIsAddMaintModalOpen] = useState(false);

  // Add Equipment Form
  const [newEqCode, setNewEqCode] = useState('');
  const [newEqName, setNewEqName] = useState('');
  const [newEqCategory, setNewEqCategory] = useState<FacilityCategory>('기계');
  const [newEqLocation, setNewEqLocation] = useState('');
  const [newEqModel, setNewEqModel] = useState('');
  const [newEqMaker, setNewEqMaker] = useState('');
  const [newEqInstallDate, setNewEqInstallDate] = useState('2026-08-01');
  const [newEqCycleMonths, setNewEqCycleMonths] = useState(120);

  // Add Maintenance Form
  const [maintEqId, setMaintEqId] = useState(equipments[0]?.id || '');
  const [maintFaultPart, setMaintFaultPart] = useState('');
  const [maintSymptom, setMaintSymptom] = useState('');
  const [maintRepairType, setMaintRepairType] = useState<RepairType>('자체수리');
  const [maintCost, setMaintCost] = useState(0);
  const [maintParts, setMaintParts] = useState('');
  const [maintTech, setMaintTech] = useState('김시설 주임');
  const [maintContractor, setMaintContractor] = useState('');
  const [maintDate, setMaintDate] = useState(new Date().toISOString().slice(0, 10));
  const [maintDesc, setMaintDesc] = useState('');

  const filteredHistory = maintenanceHistory.filter(
    m =>
      m.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.faultPart.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.technician.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEquipments = equipments.filter(
    e =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCost = maintenanceHistory.reduce((sum, m) => sum + m.cost, 0);

  const handleCreateEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEqName || !newEqCode) return;

    addEquipment({
      code: newEqCode,
      name: newEqName,
      category: newEqCategory,
      location: newEqLocation,
      modelNumber: newEqModel,
      manufacturer: newEqMaker,
      installedDate: newEqInstallDate,
      lastMaintenanceDate: newEqInstallDate,
      nextScheduledCheck: '2026-12-31',
      replacementCycleMonths: Number(newEqCycleMonths) || 120,
      status: '정상',
      specs: { '규격 사양': '표준 가동 상태' }
    });

    setIsAddEquipmentModalOpen(false);
  };

  const handleCreateMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEq = equipments.find(e => e.id === maintEqId);
    if (!targetEq) return;

    addMaintenanceRecord({
      equipmentId: targetEq.id,
      equipmentCode: targetEq.code,
      equipmentName: targetEq.name,
      category: targetEq.category,
      faultPart: maintFaultPart || '기본 점검 및 소모품 교체',
      failureSymptom: maintSymptom || '정기 예방 정비',
      repairType: maintRepairType,
      cost: Number(maintCost) || 0,
      partsConsumed: maintParts || '표준 소모품',
      technician: maintTech,
      contractorName: maintRepairType === '외주수리' ? maintContractor : undefined,
      repairDate: maintDate,
      description: maintDesc
    });

    setIsAddMaintModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-bold">
              설비 자산 및 정비 이력
            </span>
            <span className="text-xs text-slate-500">
              QR코드 설비 연동, 부품 교체 주기, 수리비용 통계 DB
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            시설 고장수리 이력 DB & QR 관리
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddEquipmentModalOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            신규 설비 등록
          </button>
          <button
            onClick={() => setIsAddMaintModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Wrench className="w-3.5 h-3.5" />
            수리 이력 수동 등록
          </button>
        </div>
      </div>

      {/* Sub Tabs & Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab('HISTORY')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeSubTab === 'HISTORY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <History className="w-3.5 h-3.5" />
            수리·정비 이력 내역 ({maintenanceHistory.length}건)
          </button>
          <button
            onClick={() => setActiveSubTab('EQUIPMENTS')}
            className={`flex-1 sm:flex-none px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeSubTab === 'EQUIPMENTS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <QrCode className="w-3.5 h-3.5" />
            등록 설비 & QR 명판 ({equipments.length}대)
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="검색어 입력..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tab 1: Maintenance History */}
      {activeSubTab === 'HISTORY' ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-3">정비 일자</th>
                    <th className="py-2.5 px-3">설비명 / 구분</th>
                    <th className="py-2.5 px-3">고장 부위 및 증상</th>
                    <th className="py-2.5 px-3 min-w-[220px]">수리 조치 내용</th>
                    <th className="py-2.5 px-3">수리 구분 / 업체</th>
                    <th className="py-2.5 px-3">소비 부품 / 자재</th>
                    <th className="py-2.5 px-3 text-right">발생 비용</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map(maint => (
                    <tr key={maint.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-600 align-top">
                        {maint.repairDate}
                      </td>

                      <td className="py-2.5 px-3 align-top">
                        <div className="font-bold text-slate-900">{maint.equipmentName}</div>
                        <div className="text-[10px] text-blue-600 font-mono mt-0.5">{maint.equipmentCode}</div>
                      </td>

                      <td className="py-2.5 px-3 align-top">
                        <div className="font-bold text-slate-800">{maint.faultPart}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{maint.failureSymptom}</div>
                      </td>

                      <td className="py-2.5 px-3 align-top text-slate-700 leading-relaxed">
                        {maint.description}
                      </td>

                      <td className="py-2.5 px-3 align-top">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${maint.repairType === '자체수리' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'}`}>
                          {maint.repairType}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {maint.contractorName || maint.technician}
                        </div>
                      </td>

                      <td className="py-2.5 px-3 align-top text-slate-600 font-medium">
                        {maint.partsConsumed}
                      </td>

                      <td className="py-2.5 px-3 align-top text-right font-bold text-indigo-700">
                        {maint.cost.toLocaleString()}원
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500">총 {filteredHistory.length}건의 정비 이력</span>
              <div className="font-bold text-slate-800">
                수리 비용 합계: <span className="text-indigo-700 font-extrabold text-sm">{totalCost.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Equipments & QR Codes */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipments.map(eq => (
            <div
              key={eq.id}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-300 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${eq.category === '소방' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                      {eq.category}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500">{eq.code}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${eq.status === '정상' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {eq.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {eq.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">📍 {eq.location}</p>

                <div className="mt-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>제조사 / 모델:</span>
                    <span className="font-semibold text-slate-800">{eq.manufacturer} ({eq.modelNumber})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>설치일자:</span>
                    <span className="font-mono">{eq.installedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>교체 수명주기:</span>
                    <span className="font-semibold">{eq.replacementCycleMonths / 12}년 ({eq.replacementCycleMonths}개월)</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">QR: {eq.code}</span>
                <button
                  onClick={() => setSelectedEquipmentForQR(eq)}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  QR 명판 출력
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Equipment QR Modal */}
      <EquipmentQRModal
        equipment={selectedEquipmentForQR}
        onClose={() => setSelectedEquipmentForQR(null)}
      />

      {/* Add Equipment Modal */}
      {isAddEquipmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">신규 기계·소방 설비 등록</h3>
              <button
                onClick={() => setIsAddEquipmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleCreateEquipment} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">설비 코드 *</label>
                  <input
                    type="text"
                    placeholder="예: EQ-M-07, EQ-F-05"
                    value={newEqCode}
                    onChange={e => setNewEqCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs uppercase focus:outline-hidden focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">구분 *</label>
                  <select
                    value={newEqCategory}
                    onChange={e => setNewEqCategory(e.target.value as FacilityCategory)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="기계">기계</option>
                    <option value="소방">소방</option>
                    <option value="수질/환경">수질/환경</option>
                    <option value="전기">전기</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">설비명 *</label>
                <input
                  type="text"
                  placeholder="예: 지하 기계실 급탕탱크 1호기"
                  value={newEqName}
                  onChange={e => setNewEqName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">설치 위치 *</label>
                <input
                  type="text"
                  placeholder="예: 지하 2층 기계실 동측"
                  value={newEqLocation}
                  onChange={e => setNewEqLocation(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">제조사</label>
                  <input
                    type="text"
                    placeholder="예: 부스타, 신한펌프 등"
                    value={newEqMaker}
                    onChange={e => setNewEqMaker(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">모델 번호</label>
                  <input
                    type="text"
                    placeholder="예: BO-3000"
                    value={newEqModel}
                    onChange={e => setNewEqModel(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">설치 일자</label>
                  <input
                    type="date"
                    value={newEqInstallDate}
                    onChange={e => setNewEqInstallDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">교체 수명주기 (개월)</label>
                  <input
                    type="number"
                    value={newEqCycleMonths}
                    onChange={e => setNewEqCycleMonths(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEquipmentModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg font-medium text-xs"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm text-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  설비 등록 및 QR 생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Maintenance Modal */}
      {isAddMaintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">수리·정비 이력 수동 등록</h3>
              <button
                onClick={() => setIsAddMaintModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleCreateMaintenance} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">대상 설비 *</label>
                <select
                  value={maintEqId}
                  onChange={e => setMaintEqId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
                >
                  {equipments.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      [{eq.category}] {eq.name} ({eq.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">고장 부위 *</label>
                  <input
                    type="text"
                    placeholder="예: 펌프 씰, 모터 베어링"
                    value={maintFaultPart}
                    onChange={e => setMaintFaultPart(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">수리 구분 *</label>
                  <select
                    value={maintRepairType}
                    onChange={e => setMaintRepairType(e.target.value as RepairType)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500 font-bold"
                  >
                    <option value="자체수리">자체 수리 (시설팀)</option>
                    <option value="외주수리">외주 수리 (전문업체)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">발생 비용 (원)</label>
                  <input
                    type="number"
                    value={maintCost === 0 ? '' : maintCost}
                    onChange={e => setMaintCost(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">정비 일자</label>
                  <input
                    type="date"
                    value={maintDate}
                    onChange={e => setMaintDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">소비 부품 / 교체 자재</label>
                <input
                  type="text"
                  placeholder="예: O링 가스켓 2EA, 윤활 구리스"
                  value={maintParts}
                  onChange={e => setMaintParts(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">수리 조치 내용 상세 *</label>
                <textarea
                  rows={3}
                  value={maintDesc}
                  onChange={e => setMaintDesc(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMaintModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg font-medium text-xs"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm text-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  정비 이력 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

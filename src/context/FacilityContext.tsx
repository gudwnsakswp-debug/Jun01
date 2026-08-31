import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Equipment,
  ChecklistItem,
  AnomalyRecord,
  StatutoryInspection,
  MaintenanceHistory,
  FacilityCategory,
  InspectionCycle,
  SeverityLevel,
  RepairType,
  AnomalyStatus
} from '../types';
import {
  INITIAL_EQUIPMENTS,
  INITIAL_CHECKLIST_ITEMS,
  INITIAL_ANOMALIES,
  INITIAL_STATUTORY_INSPECTIONS,
  INITIAL_MAINTENANCE_HISTORY
} from '../data/mockData';

interface FacilityContextType {
  equipments: Equipment[];
  checklistItems: ChecklistItem[];
  anomalies: AnomalyRecord[];
  statutoryInspections: StatutoryInspection[];
  maintenanceHistory: MaintenanceHistory[];
  
  viewMode: 'PC_WEB' | 'MOBILE_APP';
  setViewMode: (mode: 'PC_WEB' | 'MOBILE_APP') => void;
  
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  currentUser: {
    name: string;
    role: string;
    dept: string;
  };
  setCurrentUser: (user: { name: string; role: string; dept: string }) => void;

  centerInfo: {
    name: string;
    address: string;
    contact: string;
    chief: string;
  };
  setCenterInfo: (info: { name: string; address: string; contact: string; chief: string }) => void;
  
  selectedEquipmentId: string | null;
  setSelectedEquipmentId: (id: string | null) => void;
  
  // Checklist actions
  updateChecklistItem: (
    id: string,
    updates: Partial<ChecklistItem>
  ) => void;
  batchSetChecklistStatus: (
    category: FacilityCategory | 'ALL',
    cycle: InspectionCycle,
    status: 'NORMAL' | 'DEFECT' | 'NA'
  ) => void;
  
  // Anomaly actions
  reportAnomaly: (data: {
    equipmentId: string;
    title: string;
    description: string;
    severity: SeverityLevel;
    category: FacilityCategory;
    location: string;
    photoUrl?: string;
    audioNote?: string;
  }) => AnomalyRecord;
  
  updateAnomalyStatus: (id: string, status: AnomalyStatus) => void;
  
  resolveAnomaly: (
    id: string,
    resolutionData: {
      repairType: RepairType;
      cost: number;
      partsReplaced: string;
      description: string;
      photoUrl?: string;
      contractorName?: string;
    }
  ) => void;
  
  // Statutory inspection actions
  updateStatutoryInspection: (
    id: string,
    updates: Partial<StatutoryInspection>
  ) => void;
  attachStatutoryReport: (
    id: string,
    reportData: {
      fileName: string;
      fileSize: string;
      summary: string;
      findingsCount: number;
      actionRequiredCount: number;
    }
  ) => void;
  sendDDayNotification: (id: string, dDayType: 'd30' | 'd14' | 'd7' | 'd1') => void;
  
  // Equipment and Maintenance
  addEquipment: (equipment: Omit<Equipment, 'id' | 'qrPayload'>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  addMaintenanceRecord: (record: Omit<MaintenanceHistory, 'id'>) => void;
  
  // Toast notifications
  toastMessage: { title: string; desc: string; type?: 'info' | 'success' | 'warning' | 'alert' } | null;
  showToast: (title: string, desc: string, type?: 'info' | 'success' | 'warning' | 'alert') => void;
  clearToast: () => void;

  // Stats helpers
  resetToDefaults: () => void;
}

const FacilityContext = createContext<FacilityContextType | undefined>(undefined);

export const FacilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or defaults
  const [equipments, setEquipments] = useState<Equipment[]>(() => {
    const saved = localStorage.getItem('centercare_equipments');
    return saved ? JSON.parse(saved) : INITIAL_EQUIPMENTS;
  });

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('centercare_checklists');
    return saved ? JSON.parse(saved) : INITIAL_CHECKLIST_ITEMS;
  });

  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>(() => {
    const saved = localStorage.getItem('centercare_anomalies');
    return saved ? JSON.parse(saved) : INITIAL_ANOMALIES;
  });

  const [statutoryInspections, setStatutoryInspections] = useState<StatutoryInspection[]>(() => {
    const saved = localStorage.getItem('centercare_statutory');
    return saved ? JSON.parse(saved) : INITIAL_STATUTORY_INSPECTIONS;
  });

  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistory[]>(() => {
    const saved = localStorage.getItem('centercare_maintenance');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_HISTORY;
  });

  const [viewMode, setViewMode] = useState<'PC_WEB' | 'MOBILE_APP'>('PC_WEB');
  const [activeTab, setActiveTab] = useState<string>('DASHBOARD');
  
  const [currentUser, setCurrentUser] = useState({
    name: '김시설 주임',
    role: '기계·소방 시설관리자',
    dept: '시설안전운영팀'
  });

  const [centerInfo, setCenterInfo] = useState(() => {
    const saved = localStorage.getItem('centercare_center_info');
    return saved ? JSON.parse(saved) : {
      name: '국민체육센터',
      address: '서울특별시 송파구 올림픽로 424',
      contact: '02-555-1190',
      chief: '시설운영관리본부장'
    };
  });

  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type?: 'info' | 'success' | 'warning' | 'alert' } | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('centercare_equipments', JSON.stringify(equipments));
  }, [equipments]);

  useEffect(() => {
    localStorage.setItem('centercare_checklists', JSON.stringify(checklistItems));
  }, [checklistItems]);

  useEffect(() => {
    localStorage.setItem('centercare_anomalies', JSON.stringify(anomalies));
  }, [anomalies]);

  useEffect(() => {
    localStorage.setItem('centercare_statutory', JSON.stringify(statutoryInspections));
  }, [statutoryInspections]);

  useEffect(() => {
    localStorage.setItem('centercare_maintenance', JSON.stringify(maintenanceHistory));
  }, [maintenanceHistory]);

  useEffect(() => {
    localStorage.setItem('centercare_center_info', JSON.stringify(centerInfo));
  }, [centerInfo]);

  const showToast = (title: string, desc: string, type: 'info' | 'success' | 'warning' | 'alert' = 'info') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.title === title ? null : prev));
    }, 4000);
  };

  const clearToast = () => setToastMessage(null);

  const updateChecklistItem = (id: string, updates: Partial<ChecklistItem>) => {
    setChecklistItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const now = new Date();
          const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          return {
            ...item,
            ...updates,
            checkedAt: updates.status && updates.status !== 'UNCHECKED' ? timeStr : item.checkedAt,
            checkedBy: updates.status && updates.status !== 'UNCHECKED' ? currentUser.name : item.checkedBy
          };
        }
        return item;
      })
    );
  };

  const batchSetChecklistStatus = (
    category: FacilityCategory | 'ALL',
    cycle: InspectionCycle,
    status: 'NORMAL' | 'DEFECT' | 'NA'
  ) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setChecklistItems(prev =>
      prev.map(item => {
        if (
          (category === 'ALL' || item.category === category) &&
          item.cycle === cycle
        ) {
          return {
            ...item,
            status,
            checkedAt: timeStr,
            checkedBy: currentUser.name
          };
        }
        return item;
      })
    );
    showToast('일괄 점검 완료', `${cycle} ${category === 'ALL' ? '전체' : category} 항목을 '${status === 'NORMAL' ? '정상(O)' : status}' 처리했습니다.`, 'success');
  };

  const reportAnomaly = (data: {
    equipmentId: string;
    title: string;
    description: string;
    severity: SeverityLevel;
    category: FacilityCategory;
    location: string;
    photoUrl?: string;
    audioNote?: string;
  }) => {
    const eq = equipments.find(e => e.id === data.equipmentId);
    const now = new Date();
    const id = `anom-${now.getFullYear()}-${String(Date.now()).slice(-4)}`;
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newAnomaly: AnomalyRecord = {
      id,
      equipmentId: data.equipmentId,
      equipmentCode: eq ? eq.code : 'EQ-GEN',
      equipmentName: eq ? eq.name : '시설 설비',
      category: data.category,
      location: data.location || (eq ? eq.location : '센터 내'),
      title: data.title,
      description: data.description,
      severity: data.severity,
      status: 'DETECTED',
      reportedAt: timeStr,
      reportedBy: currentUser.name,
      photoUrl: data.photoUrl,
      audioNote: data.audioNote
    };

    setAnomalies(prev => [newAnomaly, ...prev]);

    // If equipment exists, update status to '요주의' or '점검필요'
    if (data.equipmentId) {
      setEquipments(prev =>
        prev.map(e => (e.id === data.equipmentId ? { ...e, status: data.severity === '긴급' ? '수리중' : '요주의' } : e))
      );
    }

    showToast('현장 이상사항 등록 완료', `[${data.severity}] ${data.title}이(가) 등록되었습니다.`, data.severity === '긴급' ? 'alert' : 'warning');
    return newAnomaly;
  };

  const updateAnomalyStatus = (id: string, status: AnomalyStatus) => {
    setAnomalies(prev =>
      prev.map(anom => (anom.id === id ? { ...anom, status } : anom))
    );
    showToast('상태 변경', `이상사항 상태가 '${status === 'IN_PROGRESS' ? '조치 중' : status === 'RESOLVED' ? '조치 완료' : '이상 감지'}'으로 변경되었습니다.`, 'info');
  };

  const resolveAnomaly = (
    id: string,
    resolutionData: {
      repairType: RepairType;
      cost: number;
      partsReplaced: string;
      description: string;
      photoUrl?: string;
      contractorName?: string;
    }
  ) => {
    const targetAnom = anomalies.find(a => a.id === id);
    if (!targetAnom) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // 1. Update Anomaly Record
    setAnomalies(prev =>
      prev.map(anom => {
        if (anom.id === id) {
          return {
            ...anom,
            status: 'RESOLVED',
            resolution: {
              resolvedAt: timeStr,
              resolvedBy: currentUser.name,
              repairType: resolutionData.repairType,
              cost: resolutionData.cost,
              partsReplaced: resolutionData.partsReplaced,
              description: resolutionData.description,
              photoUrl: resolutionData.photoUrl,
              contractorName: resolutionData.contractorName
            }
          };
        }
        return anom;
      })
    );

    // 2. Automatically create Maintenance History DB record as requested in PRD!
    const newMaintRecord: MaintenanceHistory = {
      id: `maint-${now.getFullYear()}-${String(Date.now()).slice(-4)}`,
      equipmentId: targetAnom.equipmentId,
      equipmentCode: targetAnom.equipmentCode,
      equipmentName: targetAnom.equipmentName,
      category: targetAnom.category,
      faultPart: resolutionData.partsReplaced || targetAnom.title,
      failureSymptom: targetAnom.description,
      repairType: resolutionData.repairType,
      cost: resolutionData.cost,
      partsConsumed: resolutionData.partsReplaced,
      technician: currentUser.name,
      contractorName: resolutionData.contractorName,
      repairDate: dateStr,
      description: resolutionData.description,
      beforePhoto: targetAnom.photoUrl,
      afterPhoto: resolutionData.photoUrl
    };

    setMaintenanceHistory(prev => [newMaintRecord, ...prev]);

    // 3. Reset equipment status to '정상'
    if (targetAnom.equipmentId) {
      setEquipments(prev =>
        prev.map(e => (e.id === targetAnom.equipmentId ? { ...e, status: '정상', lastMaintenanceDate: dateStr } : e))
      );
    }

    showToast('조치 완료 및 이력 저장', `${targetAnom.equipmentName} 조치 결과가 수리 이력 DB에 동기화되었습니다.`, 'success');
  };

  const updateStatutoryInspection = (id: string, updates: Partial<StatutoryInspection>) => {
    setStatutoryInspections(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
    showToast('법정 점검 정보 갱신', '법정 점검 일정이 수정되었습니다.', 'info');
  };

  const attachStatutoryReport = (
    id: string,
    reportData: {
      fileName: string;
      fileSize: string;
      summary: string;
      findingsCount: number;
      actionRequiredCount: number;
    }
  ) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    setStatutoryInspections(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'COMPLETED',
            lastInspectionDate: dateStr,
            reportAttached: {
              ...reportData,
              uploadedAt: dateStr
            }
          };
        }
        return item;
      })
    );
    showToast('외주 보고서 등록 완료', `${reportData.fileName} 파일 및 지적사항이 등록되었습니다.`, 'success');
  };

  const sendDDayNotification = (id: string, dDayType: 'd30' | 'd14' | 'd7' | 'd1') => {
    const target = statutoryInspections.find(s => s.id === id);
    if (!target) return;

    setStatutoryInspections(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            notificationsSent: {
              ...item.notificationsSent,
              [dDayType]: true
            }
          };
        }
        return item;
      })
    );

    const dDayLabel = dDayType.toUpperCase();
    showToast('알림톡/푸시 발송 완료', `[법정점검 ${dDayLabel} 알림] '${target.title}' 점검 안내가 담당자 및 관리자에게 전송되었습니다.`, 'info');
  };

  const addEquipment = (eqData: Omit<Equipment, 'id' | 'qrPayload'>) => {
    const id = `eq-${Date.now()}`;
    const qrPayload = `CENTERCARE:${eqData.code}:${eqData.name}`;
    const newEq: Equipment = {
      ...eqData,
      id,
      qrPayload
    };
    setEquipments(prev => [...prev, newEq]);
    showToast('신규 설비 등록', `${eqData.name} (${eqData.code})이(가) 등록되었습니다.`, 'success');
  };

  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    setEquipments(prev =>
      prev.map(e => (e.id === id ? { ...e, ...updates } : e))
    );
    showToast('설비 정보 수정', '설비 사양 및 점검 주기가 갱신되었습니다.', 'info');
  };

  const addMaintenanceRecord = (recordData: Omit<MaintenanceHistory, 'id'>) => {
    const id = `maint-${Date.now()}`;
    const newRec: MaintenanceHistory = {
      ...recordData,
      id
    };
    setMaintenanceHistory(prev => [newRec, ...prev]);
    showToast('수리 이력 수동 등록', `${recordData.equipmentName} 수리 이력이 등록되었습니다.`, 'success');
  };

  const resetToDefaults = () => {
    localStorage.removeItem('centercare_equipments');
    localStorage.removeItem('centercare_checklists');
    localStorage.removeItem('centercare_anomalies');
    localStorage.removeItem('centercare_statutory');
    localStorage.removeItem('centercare_maintenance');
    localStorage.removeItem('centercare_center_info');
    
    setEquipments(INITIAL_EQUIPMENTS);
    setChecklistItems(INITIAL_CHECKLIST_ITEMS);
    setAnomalies(INITIAL_ANOMALIES);
    setStatutoryInspections(INITIAL_STATUTORY_INSPECTIONS);
    setMaintenanceHistory(INITIAL_MAINTENANCE_HISTORY);
    setCenterInfo({
      name: '국민체육센터',
      address: '서울특별시 송파구 올림픽로 424',
      contact: '02-555-1190',
      chief: '시설운영관리본부장'
    });
    showToast('초기화 완료', '모든 설비, 점검표, 이력 데이터가 초기값으로 복원되었습니다.', 'info');
  };

  return (
    <FacilityContext.Provider
      value={{
        equipments,
        checklistItems,
        anomalies,
        statutoryInspections,
        maintenanceHistory,
        viewMode,
        setViewMode,
        activeTab,
        setActiveTab,
        currentUser,
        setCurrentUser,
        centerInfo,
        setCenterInfo,
        selectedEquipmentId,
        setSelectedEquipmentId,
        updateChecklistItem,
        batchSetChecklistStatus,
        reportAnomaly,
        updateAnomalyStatus,
        resolveAnomaly,
        updateStatutoryInspection,
        attachStatutoryReport,
        sendDDayNotification,
        addEquipment,
        updateEquipment,
        addMaintenanceRecord,
        toastMessage,
        showToast,
        clearToast,
        resetToDefaults
      }}
    >
      {children}
    </FacilityContext.Provider>
  );
};

export const useFacility = () => {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error('useFacility must be used within a FacilityProvider');
  }
  return context;
};

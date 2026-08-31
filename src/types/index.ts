export type FacilityCategory = '기계' | '소방' | '전기' | '수질/환경';

export type InspectionCycle = '일일' | '주간' | '월간' | '분기' | '반기' | '연간';

export type SeverityLevel = '경미' | '중요' | '긴급';

export type AnomalyStatus = 'DETECTED' | 'IN_PROGRESS' | 'RESOLVED';

export type RepairType = '자체수리' | '외주수리';

export interface Equipment {
  id: string;
  code: string;
  name: string;
  category: FacilityCategory;
  location: string;
  modelNumber: string;
  manufacturer: string;
  installedDate: string;
  lastMaintenanceDate: string;
  nextScheduledCheck: string;
  replacementCycleMonths: number;
  status: '정상' | '점검필요' | '수리중' | '요주의';
  specs: Record<string, string>;
  manualUrl?: string;
  photoUrl?: string;
  qrPayload: string;
}

export interface ChecklistItem {
  id: string;
  equipmentId?: string;
  category: FacilityCategory;
  cycle: InspectionCycle;
  location: string;
  equipmentName: string;
  itemTitle: string;
  criteria: string;
  checkMethod: '육안' | '계측' | '작동테스트' | '촉수';
  unit?: string;
  targetValue?: string;
  status: 'UNCHECKED' | 'NORMAL' | 'DEFECT' | 'NA';
  measuredValue?: string;
  notes?: string;
  photoUrl?: string;
  checkedAt?: string;
  checkedBy?: string;
}

export interface AnomalyRecord {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  category: FacilityCategory;
  location: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  status: AnomalyStatus;
  reportedAt: string;
  reportedBy: string;
  photoUrl?: string;
  audioNote?: string;
  resolution?: {
    resolvedAt: string;
    resolvedBy: string;
    repairType: RepairType;
    cost: number;
    partsReplaced: string;
    description: string;
    photoUrl?: string;
    contractorName?: string;
  };
}

export interface StatutoryInspection {
  id: string;
  title: string;
  category: FacilityCategory;
  lawBasis: string; // 관련 법령 (e.g., 소방시설법 제22조, 기계설비법 제17조)
  cycle: string;
  targetFacility: string;
  lastInspectionDate: string;
  nextDueDate: string;
  dDay: number; // calculated
  status: 'SCHEDULED' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETED';
  inspectorType: '자체관리자' | '지정 전문대행업체' | '공인검사기관 (한국가스안전공사/승강기안전공단 등)';
  contractorName?: string;
  contractorContact?: string;
  estimatedCost?: number;
  reportAttached?: {
    fileName: string;
    fileSize: string;
    uploadedAt: string;
    findingsCount: number;
    actionRequiredCount: number;
    summary: string;
  };
  notificationsSent: {
    d30: boolean;
    d14: boolean;
    d7: boolean;
    d1: boolean;
  };
}

export interface MaintenanceHistory {
  id: string;
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  category: FacilityCategory;
  faultPart: string;
  failureSymptom: string;
  repairType: RepairType;
  cost: number;
  partsConsumed: string;
  technician: string;
  contractorName?: string;
  repairDate: string;
  description: string;
  beforePhoto?: string;
  afterPhoto?: string;
}

export interface InspectionSession {
  id: string;
  date: string;
  cycle: InspectionCycle;
  category: FacilityCategory;
  inspectorName: string;
  totalItems: number;
  completedItems: number;
  normalCount: number;
  defectCount: number;
  naCount: number;
  submittedAt?: string;
  approverName?: string;
  approvalStatus: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
}

// ─── Campaign ────────────────────────────────────────────────────────────────

export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'COMPLETED';

export interface Campaign {
  id: string;
  advertiserId: string;
  name: string;
  budget: number;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignBody {
  advertiserId: string;
  name: string;
  budget: number;
  status?: CampaignStatus;
}

// ─── Media Plan ───────────────────────────────────────────────────────────────

export type PlanningStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'LIVE';

export interface LineItem {
  id: string;
  channel: string;
  format: string;
  budget: number;
  impressions: number;
  startDate: string;
  endDate: string;
}

export interface MediaPlan {
  id: string;
  campaignId: string;
  advertiserId: string;
  name: string;
  planningStatus: PlanningStatus;
  totalBudget: number;
  lineItems: LineItem[];
  createdAt: string;
  updatedAt: string;
}

// ─── API helpers ─────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

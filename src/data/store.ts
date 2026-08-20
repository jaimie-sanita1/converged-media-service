/**
 * In-memory store – seeded from seed.ts at startup.
 * All mutations are reflected immediately within the same process lifetime.
 */
import { Campaign, MediaPlan } from '../types';
import { campaigns as seedCampaigns, mediaPlans as seedMediaPlans } from './seed';

// Deep-clone seed data so tests / restarts start fresh
const cloneDeep = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

class Store {
  private campaigns: Campaign[] = cloneDeep(seedCampaigns);
  private mediaPlans: MediaPlan[] = cloneDeep(seedMediaPlans);

  // ── Campaigns ──────────────────────────────────────────────────────────────

  getCampaigns(advertiserId: string, status?: string): Campaign[] {
    return this.campaigns.filter((c) => {
      const matchesAdvertiser = c.advertiserId === advertiserId;
      const matchesStatus = status ? c.status === status : true;
      return matchesAdvertiser && matchesStatus;
    });
  }

  getCampaignById(id: string): Campaign | undefined {
    return this.campaigns.find((c) => c.id === id);
  }

  createCampaign(data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Campaign {
    const now = new Date().toISOString();
    const campaign: Campaign = {
      id: `cmp_${Date.now()}`,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.campaigns.push(campaign);
    return campaign;
  }

  // ── Media Plans ────────────────────────────────────────────────────────────

  getMediaPlanById(planId: string): MediaPlan | undefined {
    return this.mediaPlans.find((p) => p.id === planId);
  }

  getAllMediaPlans(): MediaPlan[] {
    return [...this.mediaPlans];
  }
}

// Singleton
export const store = new Store();

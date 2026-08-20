import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../data/store';
import { bearerAuth } from '../middleware/auth';
import { validateCreateCampaign, validateListCampaigns } from '../middleware/validate';
import { Campaign, CampaignStatus, CreateCampaignBody } from '../types';

const router = Router();

// ── POST /v1/campaigns ────────────────────────────────────────────────────────
// Creates a new media campaign for an advertiser.
// Collection request: "Create campaign"
router.post(
  '/',
  bearerAuth,
  validateCreateCampaign,
  (req: Request, res: Response): void => {
    const body = req.body as CreateCampaignBody;

    const campaign = store.createCampaign({
      advertiserId: body.advertiserId,
      name: body.name,
      budget: body.budget,
      status: body.status ?? 'DRAFT',
    });

    res.status(201).json({
      data: campaign,
      meta: {
        message: 'Campaign created successfully.',
      },
    });
  },
);

// ── GET /v1/campaigns ─────────────────────────────────────────────────────────
// Returns campaigns for an advertiser, optionally filtered by status.
// Collection request: "List campaigns."
router.get(
  '/',
  bearerAuth,
  validateListCampaigns,
  (req: Request, res: Response): void => {
    const { advertiserId, status } = req.query as {
      advertiserId: string;
      status?: string;
    };

    const results = store.getCampaigns(advertiserId, status);

    res.status(200).json({
      data: results,
      meta: {
        total: results.length,
        advertiserId,
        ...(status ? { status } : {}),
      },
    });
  },
);

export default router;

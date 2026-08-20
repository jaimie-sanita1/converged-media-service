import { Router, Request, Response } from 'express';
import { store } from '../data/store';
import { bearerAuth } from '../middleware/auth';
import { validateGetMediaPlan } from '../middleware/validate';

const router = Router();

// ── GET /v1/media-plans  (also tolerates /v1/media-plans/) ───────────────────
// Returns a media plan and its current planning status.
// Collection request: "Get media plan"
// Collection URL: {{baseUrl}}/v1/media-plans/?planId=plan_45678
router.get(
  ['/', ''],
  bearerAuth,
  validateGetMediaPlan,
  (req: Request, res: Response): void => {
    const { planId } = req.query as { planId: string };

    const plan = store.getMediaPlanById(planId);

    if (!plan) {
      res.status(404).json({
        error: 'Not Found',
        message: `Media plan with id '${planId}' was not found.`,
        statusCode: 404,
      });
      return;
    }

    res.status(200).json({
      data: plan,
      meta: {
        planId: plan.id,
        planningStatus: plan.planningStatus,
      },
    });
  },
);

export default router;

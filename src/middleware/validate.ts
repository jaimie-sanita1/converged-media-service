import { Request, Response, NextFunction } from 'express';

/**
 * Validates POST /v1/campaigns request body.
 * Required: advertiserId (string), name (string), budget (positive number).
 */
export function validateCreateCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { advertiserId, name, budget } = req.body as Record<string, unknown>;
  const errors: string[] = [];

  if (!advertiserId || typeof advertiserId !== 'string') {
    errors.push('advertiserId is required and must be a string.');
  }
  if (!name || typeof name !== 'string') {
    errors.push('name is required and must be a string.');
  }
  if (budget === undefined || budget === null) {
    errors.push('budget is required.');
  } else if (typeof budget !== 'number' || budget <= 0) {
    errors.push('budget must be a positive number.');
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Validation failed.',
      details: errors,
      statusCode: 400,
    });
    return;
  }

  next();
}

/**
 * Validates GET /v1/campaigns query params.
 * Required: advertiserId (string).
 * Optional: status – must be one of ACTIVE | PAUSED | DRAFT | COMPLETED.
 */
const VALID_STATUSES = new Set(['ACTIVE', 'PAUSED', 'DRAFT', 'COMPLETED']);

export function validateListCampaigns(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { advertiserId, status } = req.query as Record<string, string | undefined>;
  const errors: string[] = [];

  if (!advertiserId || typeof advertiserId !== 'string') {
    errors.push('advertiserId query parameter is required.');
  }
  if (status && !VALID_STATUSES.has(status)) {
    errors.push(`status must be one of: ${[...VALID_STATUSES].join(', ')}.`);
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Validation failed.',
      details: errors,
      statusCode: 400,
    });
    return;
  }

  next();
}

/**
 * Validates GET /v1/media-plans query params.
 * Required: planId (string).
 */
export function validateGetMediaPlan(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { planId } = req.query as Record<string, string | undefined>;

  if (!planId || typeof planId !== 'string') {
    res.status(400).json({
      error: 'Bad Request',
      message: 'planId query parameter is required.',
      statusCode: 400,
    });
    return;
  }

  next();
}

import { Request, Response, NextFunction } from 'express';

/**
 * Bearer-token auth middleware.
 *
 * Reads the expected token from the BEARER_TOKEN environment variable
 * (defaults to "demo-token" to match the collection's {{token}} variable).
 *
 * Requests without a valid Authorization: Bearer <token> header receive 401.
 */
const VALID_TOKEN = process.env.BEARER_TOKEN ?? 'demo-token';

export function bearerAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header. Expected: Bearer <token>',
      statusCode: 401,
    });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (token !== VALID_TOKEN) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid bearer token.',
      statusCode: 401,
    });
    return;
  }

  next();
}

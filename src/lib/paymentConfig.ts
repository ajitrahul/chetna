export const PAYMENTS_ENABLED =
    (process.env.NEXT_PUBLIC_PAYMENTS_ENABLED ?? 'false').toLowerCase() === 'true';

export const PAYMENTS_PAUSED_MESSAGE =
    'Credit purchases are temporarily paused while we improve payments. Existing credits continue to work.';

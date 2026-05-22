export const OFFICIAL_EMAIL = process.env.NEXT_PUBLIC_OFFICIAL_EMAIL || "waevpoint@gmail.com";

// Transactional email providers normally require a verified sender domain.
// Keep this separate from the public contact inbox so notifications can route
// to Gmail without breaking outbound delivery.
export const OUTBOUND_FROM_EMAIL = process.env.MAIL_FROM_EMAIL || "hello@waevpoint.quest";

export const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || OFFICIAL_EMAIL;

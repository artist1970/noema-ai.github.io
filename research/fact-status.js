export const FACT_STATUSES = Object.freeze({
  VERIFIED: "verified-fact",
  STRONGLY_SUPPORTED: "strongly-supported",
  PARTIALLY_SUPPORTED: "partially-supported",
  DISPUTED: "disputed",
  CONTRADICTED: "contradicted",
  INCONCLUSIVE: "inconclusive",
  OUTDATED: "outdated",
  UNEXAMINED: "unexamined"
});

export const STATUS_LABELS = Object.freeze({
  [FACT_STATUSES.VERIFIED]: "Verified fact",
  [FACT_STATUSES.STRONGLY_SUPPORTED]: "Strongly supported",
  [FACT_STATUSES.PARTIALLY_SUPPORTED]: "Partially supported",
  [FACT_STATUSES.DISPUTED]: "Disputed",
  [FACT_STATUSES.CONTRADICTED]: "Contradicted",
  [FACT_STATUSES.INCONCLUSIVE]: "Insufficient evidence",
  [FACT_STATUSES.OUTDATED]: "Outdated",
  [FACT_STATUSES.UNEXAMINED]: "Not yet verified"
});

export function statusLabel(status) {
  return STATUS_LABELS[status] || STATUS_LABELS[FACT_STATUSES.UNEXAMINED];
}

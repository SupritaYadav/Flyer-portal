export const ANALYTICS_MESSAGE =
  '[Analytics] User interacted with End-to-End Frequent Flyer Portal';

/** Simulated analytics ping: logs once per completed primary action. */
export function track() {
  console.log(ANALYTICS_MESSAGE);
}

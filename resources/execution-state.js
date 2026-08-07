export const RESOURCE_EXECUTION_STATES = Object.freeze({
  EXECUTED:"EXECUTED",
  DISCOVERED:"DISCOVERED",
  HANDOFF:"HANDOFF",
  UNAVAILABLE:"UNAVAILABLE"
});

export function validResourceExecutionState(value) {
  return Object.values(RESOURCE_EXECUTION_STATES).includes(value);
}

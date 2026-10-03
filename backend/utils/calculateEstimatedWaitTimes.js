const DEFAULT_PREPARATION_TIME = 5;
const ACTIVE_STATUSES = new Set(['pending', 'preparing']);
const EXTRA_UNIT_PREPARATION_FACTOR = 0.5;

const getTokenId = (token) => String(token._id ?? token.id);

const getPreparationTime = (token, preparationTimes) => {
  const itemName = String(token.itemName || '').trim().toLowerCase();
  const configuredTime = Number(preparationTimes.get(itemName));
  return Number.isFinite(configuredTime) && configuredTime >= 0
    ? configuredTime
    : DEFAULT_PREPARATION_TIME;
};

const getRemainingPreparationTime = (token, preparationTimes, now) => {
  const quantity = Math.max(1, Number(token.quantity) || 1);
  const baseTime = getPreparationTime(token, preparationTimes);
  const totalTime = baseTime * (1 + (quantity - 1) * EXTRA_UNIT_PREPARATION_FACTOR);

  if (token.status !== 'preparing') return totalTime;

  const startedAt = token.preparingAt || token.createdAt;
  const startedAtMs = new Date(startedAt).getTime();
  const elapsedMinutes = Number.isFinite(startedAtMs)
    ? Math.max(0, (now.getTime() - startedAtMs) / 60000)
    : 0;

  return Math.max(0, totalTime - elapsedMinutes);
};

export const calculateEstimatedWaitTimes = (
  tokens,
  preparationTimes = new Map(),
  now = new Date()
) => {
  const orderedQueue = tokens
    .filter(token => ACTIVE_STATUSES.has(token.status))
    .slice()
    .sort((first, second) => {
      const firstCreated = new Date(first.createdAt).getTime();
      const secondCreated = new Date(second.createdAt).getTime();
      const timeDifference = firstCreated - secondCreated;
      return timeDifference || getTokenId(first).localeCompare(getTokenId(second));
    });

  let queueMinutes = 0;
  const estimatedWaits = new Map();

  for (const token of orderedQueue) {
    queueMinutes += getRemainingPreparationTime(token, preparationTimes, now);
    estimatedWaits.set(getTokenId(token), Math.max(0, Math.ceil(queueMinutes)));
  }

  return estimatedWaits;
};
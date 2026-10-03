import React from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function OrderWaitEstimate({ token, compact = false }) {
  if (token.status === 'ready') {
    return <span className="text-sm font-semibold text-green-400">Ready for pickup</span>;
  }

  if (token.status === 'served') {
    return <span className="text-sm font-semibold text-blue-400">Order completed</span>;
  }

  if (token.status === 'cancelled') {
    return <span className="text-sm font-semibold text-gray-400">Order cancelled</span>;
  }

  if (!Number.isFinite(token.estimatedWaitMinutes)) {
    return <span className="text-sm text-gray-500">Estimated time unavailable</span>;
  }

  const minutes = Math.max(0, Math.ceil(token.estimatedWaitMinutes));
  const label = minutes === 0
    ? 'Almost ready'
    : minutes <= 2
      ? `Almost ready - approximately ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
      : compact
        ? `${minutes} min`
        : `Estimated wait: ${minutes} minutes`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${token.status === 'preparing' ? 'text-amber-300' : 'text-blue-300'}`}
      aria-label={`Estimated wait ${minutes} minutes`}
    >
      <AccessTimeIcon aria-hidden="true" sx={{ fontSize: 16 }} />
      {label}
    </span>
  );
}
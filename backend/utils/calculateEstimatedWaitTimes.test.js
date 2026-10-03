import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEstimatedWaitTimes } from './calculateEstimatedWaitTimes.js';

const now = new Date('2026-10-03T12:00:00.000Z');
const prepTimes = new Map([
  ['burger', 5],
  ['pizza', 10],
  ['fries', 4],
  ['drink', 2],
]);

const token = (id, itemName, options = {}) => ({
  _id: id,
  itemName,
  quantity: 1,
  status: 'pending',
  createdAt: now,
  ...options,
});

test('estimates one active order with no orders ahead', () => {
  const estimates = calculateEstimatedWaitTimes([token('a', 'Burger')], prepTimes, now);
  assert.equal(estimates.get('a'), 5);
});

test('adds each earlier active token and includes the current token once', () => {
  const estimates = calculateEstimatedWaitTimes([
    token('a', 'Burger', { createdAt: new Date(now.getTime() - 3000) }),
    token('b', 'Pizza', { createdAt: new Date(now.getTime() - 2000) }),
    token('c', 'Fries', { createdAt: new Date(now.getTime() - 1000) }),
    token('d', 'Burger'),
  ], prepTimes, now);
  assert.equal(estimates.get('d'), 24);
});

test('ready, served, cancelled, and rejected tokens do not contribute', () => {
  const estimates = calculateEstimatedWaitTimes([
    token('ready', 'Pizza', { status: 'ready' }),
    token('served', 'Pizza', { status: 'served' }),
    token('cancelled', 'Pizza', { status: 'cancelled' }),
    token('rejected', 'Pizza', { status: 'rejected' }),
    token('active', 'Burger'),
  ], prepTimes, now);
  assert.equal(estimates.size, 1);
  assert.equal(estimates.get('active'), 5);
});

test('subtracts elapsed preparing time from preparing orders', () => {
  const estimates = calculateEstimatedWaitTimes([
    token('a', 'Burger', {
      status: 'preparing',
      preparingAt: new Date(now.getTime() - 7 * 60000),
    }),
  ], prepTimes, now);
  assert.equal(estimates.get('a'), 0);
});

test('uses creation time for old preparing tokens without preparingAt', () => {
  const estimates = calculateEstimatedWaitTimes([
    token('a', 'Pizza', {
      status: 'preparing',
      createdAt: new Date(now.getTime() - 7 * 60000),
    }),
  ], prepTimes, now);
  assert.equal(estimates.get('a'), 3);
});

test('scales extra quantity at half preparation time per additional unit', () => {
  const estimates = calculateEstimatedWaitTimes([
    token('a', 'Burger', { quantity: 3 }),
  ], prepTimes, now);
  assert.equal(estimates.get('a'), 10);
});

test('sums different food preparation times across multiple tokens', () => {
  const estimates = calculateEstimatedWaitTimes([
    token('burger', 'Burger', { createdAt: new Date(now.getTime() - 2000) }),
    token('fries', 'Fries', { createdAt: new Date(now.getTime() - 1000) }),
    token('drink', 'Drink'),
  ], prepTimes, now);
  assert.equal(estimates.get('drink'), 11);
});

test('uses a safe default for menu items without configured preparation time', () => {
  const estimates = calculateEstimatedWaitTimes([token('a', 'Unknown item')], new Map(), now);
  assert.equal(estimates.get('a'), 5);
});

test('never returns negative time and remains deterministic after refresh', () => {
  const preparing = token('a', 'Burger', {
    status: 'preparing',
    preparingAt: new Date(now.getTime() - 20 * 60000),
  });
  const first = calculateEstimatedWaitTimes([preparing], prepTimes, now);
  const refreshed = calculateEstimatedWaitTimes([preparing], prepTimes, now);
  assert.equal(first.get('a'), 0);
  assert.deepEqual(refreshed, first);
});

test('orders tokens with identical timestamps deterministically', () => {
  const estimates = calculateEstimatedWaitTimes([
    token('b', 'Pizza'),
    token('a', 'Burger'),
  ], prepTimes, now);
  assert.equal(estimates.get('a'), 5);
  assert.equal(estimates.get('b'), 15);
});
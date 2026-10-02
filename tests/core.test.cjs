/* Copyright (c) 2026 biaogebaofu. All rights reserved. See LICENSE. */
'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const vm = require('node:vm');
const fs = require('node:fs');
const core = require('../assets/core.js');
const originalBias = require('./fixtures/original-bias.cjs');
const STEP = core.constants.TWO_HOURS;
const ms = value => Date.parse(value);
const approx = (actual, expected) => assert.ok(Math.abs(actual-expected) < 1e-12, `${actual} != ${expected}`);
const prices = (start, count, fn = i => 100+i) => Array.from({length:count},(_,i) => [start+i*STEP,fn(i)]);

test('UMD exposes the same browser API without requiring Node globals', () => {
  const browser = {Date, console};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/core.js'),'utf8'),browser);
  assert.equal(typeof browser.CycleCore.calendarState,'function');
  assert.equal(browser.CycleCore.calcBias(ms('2026-10-02T08:00:00+08:00')),core.calcBias(ms('2026-10-02T08:00:00+08:00')));
});

test('bias exactly matches the original JS at every 2H point from 2019 through 2033', () => {
  for (let t = ms('2019-01-01T00:00:00+08:00'); t < ms('2033-01-01T00:00:00+08:00'); t += STEP) {
    assert.equal(core.calcBias(t),originalBias(new Date(t)),new Date(t).toISOString());
  }
  for (const stamp of ['1999-12-31T23:59:59+08:00','2000-01-07T00:00:00+08:00','2028-02-29T23:59:59+08:00']) {
    assert.equal(core.calcBias(new Date(stamp)),originalBias(new Date(stamp)));
  }
});

test('calendar matches original Python at every phase boundary and across leap days', () => {
  const state = core.calendarState(ms('2026-10-02T12:00:00+08:00'));
  const timestamps = state.chart_intervals.flatMap(row => [row.start_epoch*1000-1000,row.start_epoch*1000,row.start_epoch*1000+1000]);
  timestamps.push(ms('2028-02-29T12:00:00+08:00'),ms('2024-02-29T12:00:00+08:00'),
    ms('2026-09-15T00:00:00+08:00'),ms('2031-09-15T00:00:00+08:00'),ms('2026-10-02T12:00:00.123+08:00'));
  const result = spawnSync(process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3'),
    [path.join(__dirname,'calendar_reference.py')],{input:JSON.stringify(timestamps),encoding:'utf8',maxBuffer:32*1024*1024});
  assert.equal(result.status,0,result.error ? result.error.message : result.stderr);
  JSON.parse(result.stdout).forEach((expected,i) => assert.deepEqual(core.calendarState(timestamps[i]),expected));
  assert.equal(state.table.intervals.length,13);
  assert.equal(state.table.next_switch_after_window,'2032-02-17T14:00:00+08:00');
});

test('calendar responses do not leak mutable cached objects', () => {
  const now = ms('2026-10-02T12:00:00+08:00'), first = core.calendarState(now);
  first.table.intervals[0].direction = 0;
  first.chart_intervals[0].direction = 0;
  const second = core.calendarState(now);
  assert.equal(second.table.intervals[0].direction,-1);
  assert.notEqual(second.chart_intervals[0].direction,0);
});

test('strict validation rejects nonfinite values, duplicates, reversed rows and unaligned candles', () => {
  const start = ms('2026-10-01T00:00:00Z');
  for (const invalid of [[],[[start,0]],[[start,NaN]],[[start,Infinity]],[[start,'100']],[[start+1,100]],
    [[start,100],[start,101]],[[start+STEP,100],[start,101]],[[start,100,101]],[[NaN,100]]]) {
    assert.throws(() => core.backtest(invalid));
    assert.throws(() => core.midpointBacktest(invalid));
  }
  for (const invalid of [{costBps:-1},{costBps:Infinity},{costBps:'5'},{startMs:start,endMs:start},{startMs:'today'}]) {
    assert.throws(() => core.backtest(prices(start,2),invalid));
  }
  assert.throws(() => core.calcBias(new Date('invalid')));
  assert.throws(() => core.calendarState(Infinity));
});

test('horizon stats use opening-time signals, close entry, direction and round-trip costs', () => {
  const start = ms('2026-01-01T00:00:00Z'), data = prices(start,200,i => 100+Math.sin(i/4)*8+i*.01);
  const result = core.backtest(data,{costBps:7});
  for (const horizon of result.horizons) {
    const rows = data.slice(0,-horizon.bars).map((row,i) => {
      const bias = originalBias(new Date(row[0])), side = bias > .1 ? 1 : bias < -.1 ? -1 : 0;
      const gross = side*(data[i+horizon.bars][1]/row[1]-1);
      return {side,gross,net:gross-.0014};
    }).filter(r => r.side);
    for (const [name,side] of [['long',1],['short',-1],['combined',0]]) {
      const selected = rows.filter(r => !side || r.side === side), actual = horizon[name];
      assert.equal(actual.samples,selected.length);
      if (!selected.length) {assert.equal(actual.meanReturn,null);continue;}
      approx(actual.meanReturn,selected.reduce((sum,r) => sum+r.net,0)/selected.length);
      approx(actual.meanGrossReturn,selected.reduce((sum,r) => sum+r.gross,0)/selected.length);
      approx(actual.winRate,selected.filter(r => r.net > 0).length/selected.length);
    }
  }
  assert.equal(result.summary.overlappingSamples,true);
  assert.equal(result.parameters.roundTripCost,.0014);
  assert.equal(result.horizons[5].hours,168);
});

test('horizon window includes entry at start and exit at cutoff, excludes incomplete tails', () => {
  const start = ms('2026-01-01T00:00:00Z'), data = prices(start,4);
  const options = {startMs:start+STEP,endMs:start+3*STEP};
  const result = core.backtest(data,options).horizons[0];
  const expected = data.slice(0,2).filter(row => Math.abs(core.calcBias(row[0])) > .1).length;
  assert.equal(result.combined.samples,expected);
  assert.equal(core.backtest(data,{startMs:start+3*STEP,endMs:start+4*STEP}).horizons[1].combined.samples,0);
  const empty = core.backtest(data,{startMs:start+3*STEP,endMs:start+4*STEP}).horizons[1].combined;
  assert.deepEqual(empty,{samples:0,winRate:null,meanReturn:null,medianReturn:null,meanGrossReturn:null});
});

test('horizon sampling cannot cross missing candles by treating row count as elapsed time', () => {
  const start = ms('2026-01-01T00:00:00Z'), continuous = prices(start,80), data = continuous.filter((_,i) => i !== 30);
  const result = core.backtest(data);
  assert.equal(result.summary.gapCount,1);
  assert.equal(result.summary.missingCandles,1);
  assert.ok(result.horizons.some(h => h.skippedGaps > 0));
  for (const horizon of result.horizons) {
    const expected = data.slice(0,-horizon.bars).filter((row,i) => Math.abs(core.calcBias(row[0])) > .1
      && data[i+horizon.bars][0]-row[0] === horizon.bars*STEP).length;
    assert.equal(horizon.combined.samples,expected);
  }
});

test('midpoint legs follow the direction calendar and keep final open mark out of completed stats', () => {
  const start = ms('2026-08-01T00:00:00+08:00'), end = ms('2027-03-01T00:00:00+08:00');
  const data = prices(start,(end-start)/STEP,i => 100+i*.005), result = core.midpointBacktest(data,{costBps:5});
  assert.equal(result.trades.length,2);
  assert.equal(result.trades[0].entryMs,ms('2026-09-06T02:00:00+08:00'));
  assert.equal(result.trades[0].exitMs,ms('2027-02-17T02:00:00+08:00'));
  assert.equal(result.trades[0].direction,-1);
  assert.equal(result.trades[0].completed,true);
  assert.equal(result.trades[1].direction,1);
  assert.equal(result.trades[1].completed,false);
  assert.equal(result.combined.samples,1);
  approx(result.trades[0].netReturn,result.trades[0].grossReturn-.001);
  approx(result.trades[1].netReturn,result.trades[1].grossReturn-.0005);
  assert.equal(result.summary.maeAvailable,false);
  assert.equal(result.summary.openTrades,1);
});

test('midpoint window has no inherited position and cutoff before the next switch stays open', () => {
  const start = ms('2026-08-01T00:00:00+08:00'), end = ms('2027-03-01T00:00:00+08:00');
  const data = prices(start,(end-start)/STEP);
  const later = core.midpointBacktest(data,{startMs:ms('2026-09-07T00:00:00+08:00')});
  assert.equal(later.trades.length,1);
  assert.equal(later.trades[0].direction,1);
  assert.equal(later.combined.samples,0);
  const cutoff = ms('2026-12-01T01:00:00+08:00');
  const earlier = core.midpointBacktest(data,{endMs:cutoff});
  assert.equal(earlier.trades.length,1);
  assert.equal(earlier.trades[0].completed,false);
  assert.ok(earlier.trades[0].exitMs <= cutoff);
  assert.equal(earlier.combined.samples,0);
});

test('missing exact midpoint execution candles are skipped rather than filled late', () => {
  const start = ms('2026-08-01T00:00:00+08:00'), end = ms('2027-03-01T00:00:00+08:00');
  const original = prices(start,(end-start)/STEP);
  const entryOpening = ms('2026-09-06T00:00:00+08:00'), exitOpening = ms('2027-02-17T00:00:00+08:00');
  const noEntry = core.midpointBacktest(original.filter(row => row[0] !== entryOpening));
  assert.equal(noEntry.summary.skipped[0].reason,'missing_entry_candle');
  assert.equal(noEntry.trades.length,1);
  const noExit = core.midpointBacktest(original.filter(row => row[0] !== exitOpening));
  assert.ok(noExit.summary.skipped.some(row => row.reason === 'missing_exit_candle'));
  assert.equal(noExit.trades.length,0);
});

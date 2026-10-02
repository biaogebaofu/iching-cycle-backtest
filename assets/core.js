/* Copyright (c) 2026 biaogebaofu. All rights reserved. See LICENSE. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CycleCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const DAY = 86400000, TWO_HOURS = 7200000, BEIJING = 8 * 3600000;
  const HORIZONS = [1, 3, 6, 12, 36, 84];
  const BOUNDARIES = [[2,4],[3,6],[4,5],[5,6],[6,6],[7,7],[8,7],[9,8],[10,8],[11,7],[12,7],[1,6]];
  const TABLE_START = Date.parse('2026-09-15T00:00:00+08:00');
  const TABLE_END = Date.parse('2031-09-15T00:00:00+08:00');
  const CHART_START = Date.parse('2019-01-01T00:00:00+08:00');
  const CHART_END = Date.parse('2033-01-01T00:00:00+08:00');
  const eventCache = new Map();
  let tableCache, chartCache;

  function timestamp(value, name) {
    const ms = value instanceof Date ? value.getTime() : value;
    if (typeof ms !== 'number' || !Number.isFinite(ms) || !Number.isSafeInteger(ms) || Number.isNaN(new Date(ms).getTime())) {
      throw new TypeError((name || 'Timestamp') + ' must be a valid integer epoch millisecond timestamp.');
    }
    return ms;
  }

  function formatBeijing(value) {
    const ms = timestamp(value);
    const iso = new Date(ms + BEIJING).toISOString();
    return iso.replace(/\.000Z$/, '+08:00').replace(/\.(\d{3})Z$/, '.$1000+08:00');
  }

  // Preserve the supplied chart's original formula, including its month ordering.
  function calcBias(value) {
    const t = new Date(timestamp(value) + BEIJING);
    const BIAS = {木:0.3,火:0.5,土:0,金:-0.3,水:-0.5};
    const GEN = {木:'火',火:'土',土:'金',金:'水',水:'木'};
    const CTL = {木:'土',土:'水',水:'火',火:'金',金:'木'};
    const days2 = Math.floor((t - new Date(Date.UTC(2000,0,7))) / DAY);
    const ds = ((days2 % 10) + 10) % 10;
    const de = '木木火火土土金金水水'[ds];
    const dy = '阳阴阳阴阳阴阳阴阳阴'[ds];
    const m = t.getUTCMonth()+1, d = t.getUTCDate();
    let mi = 11;
    for (let i = 0; i < BOUNDARIES.length; i++) {
      if (m < BOUNDARIES[i][0] || (m === BOUNDARIES[i][0] && d < BOUNDARIES[i][1])) { mi = i > 0 ? i-1 : 11; break; }
    }
    const ys = (t.getUTCFullYear() - 4) % 10;
    const ms = ([2,4,6,8,0][ys%5] + mi) % 10;
    const me = '木木火火土土金金水水'[ms];
    const h = t.getUTCHours(), bi = ((h+1)%24) >> 1;
    const hs = ([0,2,4,6,8][ds%5] + bi) % 10;
    const he = '木木火火土土金金水水'[hs];
    let bias = (BIAS[de]||0)*0.35 + (BIAS[me]||0)*0.25 + (BIAS[he]||0)*0.20;
    if (GEN[de]===me) bias += 0.15; if (CTL[de]===me) bias -= 0.15;
    if (GEN[me]===de) bias += 0.1; if (CTL[me]===de) bias -= 0.1;
    if (GEN[he]===de) bias += 0.08; if (CTL[he]===de) bias -= 0.08;
    bias *= dy === '阳' ? 1.15 : 0.85;
    return Math.max(-1, Math.min(1, bias));
  }

  function utcDate(year, month, day) {
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(0, 0, 0, 0);
    return date.getTime() - BEIJING;
  }

  function bandColor(ms) {
    const date = new Date(ms + BEIJING), m = date.getUTCMonth()+1, d = date.getUTCDate();
    let index = 11;
    for (let i = 0; i < BOUNDARIES.length; i++) {
      if (m < BOUNDARIES[i][0] || (m === BOUNDARIES[i][0] && d < BOUNDARIES[i][1])) { index = i ? i-1 : 11; break; }
    }
    const yearMod = ((date.getUTCFullYear() - 4) % 5 + 5) % 5;
    const stem = (2 * yearMod + 2 + index) % 10;
    return stem <= 5 ? 'red' : stem >= 8 ? 'green' : 'neutral';
  }

  function switchEvents(year) {
    if (eventCache.has(year)) return eventCache.get(year);
    const bands = [], stop = utcDate(year+3, 1, 1);
    for (let day = utcDate(year-2, 1, 1); day < stop; day += DAY) {
      const color = bandColor(day), last = bands[bands.length-1];
      if (!last || color !== last.color) bands.push({start:day, end:day+DAY, color});
      else last.end = day + DAY;
    }
    const events = bands.slice(1,-1).filter(b => b.color !== 'neutral').map(b => {
      const center = b.start + (b.end - b.start) / 2;
      return {switchMs:(Math.ceil(center / TWO_HOURS)+1)*TWO_HOURS, direction:b.color === 'green' ? 1 : -1,
        center, bandStart:b.start, bandEnd:b.end};
    });
    eventCache.set(year, events);
    return events;
  }

  function eventsForRange(start, end) {
    const firstYear = new Date(start+BEIJING).getUTCFullYear(), lastYear = new Date(end+BEIJING).getUTCFullYear();
    const events = new Map();
    for (let year = firstYear; year <= lastYear; year++) {
      for (const event of switchEvents(year)) events.set(event.switchMs, event);
    }
    return Array.from(events.values()).sort((a,b) => a.switchMs-b.switchMs);
  }

  function phase(event, following) {
    return {start:formatBeijing(event.switchMs), end_exclusive:formatBeijing(following.switchMs),
      start_epoch:event.switchMs/1000, end_epoch:following.switchMs/1000, direction:event.direction,
      label:event.direction === 1 ? '只多／可空仓' : '只空／可空仓',
      allowed_position:event.direction === 1 ? 'long_or_flat' : 'short_or_flat',
      origin_switch:formatBeijing(event.switchMs), band_center:formatBeijing(event.center),
      band_start:formatBeijing(event.bandStart), band_end_exclusive:formatBeijing(event.bandEnd),
      next_switch:formatBeijing(following.switchMs)};
  }

  function fiveYearTable() {
    if (!tableCache) {
      const events = eventsForRange(TABLE_START,TABLE_END), intervals = [];
      for (let i = 0; i < events.length-1; i++) {
        const event = events[i], next = events[i+1];
        if (next.switchMs <= TABLE_START || event.switchMs >= TABLE_END) continue;
        const row = phase(event,next), start = Math.max(event.switchMs,TABLE_START), end = Math.min(next.switchMs,TABLE_END);
        Object.assign(row,{start:formatBeijing(start), end_exclusive:formatBeijing(end), start_epoch:start/1000, end_epoch:end/1000});
        intervals.push(row);
      }
      tableCache = {status:'FORMULA_ONLY_NOT_CONNECTED_TO_TRADING',timezone:'UTC+08:00',start:formatBeijing(TABLE_START),
        end_exclusive:formatBeijing(TABLE_END),rule:'red-band midpoint -> short only; green-band midpoint -> long only; effective at 2H candle close',
        intervals, next_switch_after_window:intervals[intervals.length-1].next_switch};
    }
    return JSON.parse(JSON.stringify(tableCache));
  }

  function chartIntervals() {
    if (!chartCache) {
      const events = eventsForRange(CHART_START,CHART_END);
      chartCache = [];
      for (let i = 0; i < events.length-1; i++) {
        if (events[i+1].switchMs > CHART_START && events[i].switchMs < CHART_END) chartCache.push(phase(events[i],events[i+1]));
      }
    }
    return JSON.parse(JSON.stringify(chartCache));
  }

  function calendarState(value) {
    const now = timestamp(value === undefined ? Date.now() : value, 'nowMs');
    const events = switchEvents(new Date(now+BEIJING).getUTCFullYear());
    let index = -1;
    for (let i = 0; i < events.length && events[i].switchMs <= now; i++) index = i;
    if (index < 0 || index+2 >= events.length) throw new RangeError('Calendar timestamp is outside the supported date range.');
    return {timezone:'UTC+08:00',server_now:formatBeijing(now),server_now_epoch:now/1000,
      current:phase(events[index],events[index+1]),next:phase(events[index+1],events[index+2]),
      table:fiveYearTable(),chart_intervals:chartIntervals()};
  }

  function validatePrices(prices) {
    if (!Array.isArray(prices) || !prices.length) throw new TypeError('prices must be a nonempty array of [epochMilliseconds, close].');
    const gaps = [], prefix = [0];
    for (let i = 0; i < prices.length; i++) {
      const row = prices[i];
      if (!Array.isArray(row) || row.length !== 2) throw new TypeError('Each price row must contain exactly timestamp and close.');
      const ms = timestamp(row[0], 'Price timestamp');
      if (ms % TWO_HOURS !== 0) throw new RangeError('Price timestamps must align to UTC 2H candle openings.');
      if (typeof row[1] !== 'number' || !Number.isFinite(row[1]) || row[1] <= 0) throw new TypeError('Close prices must be positive finite numbers.');
      if (i) {
        const delta = ms - prices[i-1][0];
        if (delta <= 0) throw new RangeError('Price timestamps must be strictly increasing and unique.');
        if (delta !== TWO_HOURS) gaps.push({afterMs:prices[i-1][0],beforeMs:ms,missingCandles:delta/TWO_HOURS-1});
        prefix.push(prefix[i-1] + (delta !== TWO_HOURS ? 1 : 0));
      }
    }
    return {gaps,prefix};
  }

  function settings(prices, options) {
    const validation = validatePrices(prices);
    const input = options === undefined ? {} : options;
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('Options must be an object.');
    const startMs = timestamp(input.startMs === undefined ? prices[0][0]+TWO_HOURS : input.startMs,'startMs');
    const endMs = timestamp(input.endMs === undefined ? prices[prices.length-1][0]+TWO_HOURS : input.endMs,'endMs');
    if (startMs >= endMs) throw new RangeError('startMs must be earlier than endMs.');
    const costBps = input.costBps === undefined ? 0 : input.costBps;
    if (typeof costBps !== 'number' || !Number.isFinite(costBps) || costBps < 0) throw new RangeError('costBps must be a finite nonnegative number.');
    return {...validation,startMs,endMs,costBps,oneWayCost:costBps/10000,roundTripCost:2*costBps/10000};
  }

  function stats(rows) {
    if (!rows.length) return {samples:0,winRate:null,meanReturn:null,medianReturn:null,meanGrossReturn:null};
    const sorted = rows.map(r => r.netReturn).sort((a,b) => a-b), middle = Math.floor(sorted.length/2);
    return {samples:rows.length,winRate:rows.filter(r => r.netReturn > 0).length/rows.length,
      meanReturn:rows.reduce((a,r) => a+r.netReturn,0)/rows.length,
      medianReturn:sorted.length%2 ? sorted[middle] : (sorted[middle-1]+sorted[middle])/2,
      meanGrossReturn:rows.reduce((a,r) => a+r.grossReturn,0)/rows.length};
  }

  function baseSummary(prices, config) {
    return {candles:prices.length,firstOpenMs:prices[0][0],lastCloseMs:prices[prices.length-1][0]+TWO_HOURS,
      windowStartMs:config.startMs,windowEndMs:config.endMs,gaps:config.gaps,gapCount:config.gaps.length,
      missingCandles:config.gaps.reduce((sum,gap) => sum+gap.missingCandles,0)};
  }

  function backtest(prices, options) {
    const config = settings(prices,options), biases = prices.map(row => calcBias(row[0]));
    const horizons = HORIZONS.map(bars => {
      const rows = []; let skippedGaps = 0, skippedIncomplete = 0, skippedOutsideWindow = 0;
      for (let i = 0; i < prices.length; i++) {
        const entryMs = prices[i][0]+TWO_HOURS, direction = biases[i] > .1 ? 1 : biases[i] < -.1 ? -1 : 0;
        if (!direction || entryMs < config.startMs || entryMs > config.endMs) continue;
        const exit = i+bars;
        if (exit >= prices.length) {skippedIncomplete++;continue;}
        if (prices[exit][0]+TWO_HOURS > config.endMs) {skippedOutsideWindow++;continue;}
        if (config.prefix[exit] !== config.prefix[i]) {skippedGaps++;continue;}
        const grossReturn = direction*(prices[exit][1]/prices[i][1]-1);
        if (!Number.isFinite(grossReturn)) throw new RangeError('Price ratios must produce finite returns.');
        rows.push({direction,grossReturn,netReturn:grossReturn-config.roundTripCost});
      }
      return {bars,hours:bars*2,long:stats(rows.filter(r => r.direction === 1)),short:stats(rows.filter(r => r.direction === -1)),
        combined:stats(rows),skippedGaps,skippedIncomplete,skippedOutsideWindow};
    });
    return {parameters:{startMs:config.startMs,endMs:config.endMs,costBps:config.costBps,roundTripCost:config.roundTripCost,
      threshold:.1,candleHours:2,horizonBars:HORIZONS.slice(),timezone:'UTC+08:00',signalTime:'candle_open',entryTime:'candle_close',
      costModel:'two flat deductions relative to entry notional',fundingFeesIncluded:false},
      summary:{...baseSummary(prices,config),overlappingSamples:true,skippedGaps:horizons.reduce((n,h) => n+h.skippedGaps,0)},horizons};
  }

  function midpointBacktest(prices, options) {
    const config = settings(prices,options), byTimestamp = new Map(prices.map((row,i) => [row[0],i]));
    const events = eventsForRange(prices[0][0],prices[prices.length-1][0]+TWO_HOURS);
    let markIndex = prices.length-1;
    while (markIndex >= 0 && prices[markIndex][0]+TWO_HOURS > config.endMs) markIndex--;
    const trades = [], skipped = [];
    for (let i = 0; i < events.length-1; i++) {
      const event = events[i], next = events[i+1];
      if (event.switchMs < config.startMs || event.switchMs > config.endMs || event.switchMs > prices[prices.length-1][0]+TWO_HOURS) continue;
      const entryIndex = byTimestamp.get(event.switchMs-TWO_HOURS);
      if (entryIndex === undefined) {skipped.push({eventMs:event.switchMs,reason:'missing_entry_candle'});continue;}
      const completed = next.switchMs <= config.endMs && next.switchMs <= prices[prices.length-1][0]+TWO_HOURS;
      const exitIndex = completed ? byTimestamp.get(next.switchMs-TWO_HOURS) : markIndex;
      if (exitIndex === undefined) {skipped.push({eventMs:event.switchMs,exitEventMs:next.switchMs,reason:'missing_exit_candle'});continue;}
      if (exitIndex < entryIndex) continue;
      const grossReturn = event.direction*(prices[exitIndex][1]/prices[entryIndex][1]-1);
      if (!Number.isFinite(grossReturn)) throw new RangeError('Price ratios must produce finite returns.');
      trades.push({centerMs:event.center,entryMs:event.switchMs,exitMs:prices[exitIndex][0]+TWO_HOURS,
        scheduledExitMs:next.switchMs,direction:event.direction,entryPrice:prices[entryIndex][1],exitPrice:prices[exitIndex][1],
        grossReturn,netReturn:grossReturn-(completed ? config.roundTripCost : config.oneWayCost),completed,
        days:(prices[exitIndex][0]+TWO_HOURS-event.switchMs)/DAY,
        gapCount:config.prefix[exitIndex]-config.prefix[entryIndex]});
    }
    const closed = trades.filter(t => t.completed);
    return {parameters:{startMs:config.startMs,endMs:config.endMs,costBps:config.costBps,roundTripCost:config.roundTripCost,
      fraction:.5,shiftDays:0,alternate:false,timezone:'UTC+08:00',redDirection:-1,greenDirection:1,
      execution:'first 2H candle opening at or after band midpoint; fill at its close',
      costModel:'two flat deductions relative to entry notional; open mark deducts entry cost only',fundingFeesIncluded:false},
      summary:{...baseSummary(prices,config),completedTrades:closed.length,openTrades:trades.length-closed.length,
        skipped,skippedEvents:skipped.length,maeAvailable:false,overlappingSamples:false},
      long:stats(closed.filter(t => t.direction === 1)),short:stats(closed.filter(t => t.direction === -1)),combined:stats(closed),trades};
  }

  return {calcBias,calendarState,backtest,midpointBacktest,formatBeijing,
    constants:Object.freeze({DAY,TWO_HOURS,BEIJING,TABLE_START,TABLE_END,CHART_START,CHART_END})};
});

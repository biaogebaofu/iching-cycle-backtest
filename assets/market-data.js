/* Copyright (c) 2026 biaogebaofu. All rights reserved. See LICENSE. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CycleMarket = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const DAY = 86400000, STEP = 7200000, BEIJING = 28800000;
  const ALLOWED_BASE_URLS = Object.freeze(['https://openapi.okx.com','https://us.okx.com','https://eea.okx.com']);
  const REQUEST_INTERVAL = 334, REQUEST_TIMEOUT = 15000;

  function failure(name, message) {
    const error = new Error(message);
    error.name = name;
    return error;
  }

  function checkCancelled(signal) {
    if (signal && signal.aborted) throw failure('AbortError','Market data request cancelled.');
  }

  function wait(ms, signal) {
    checkCancelled(signal);
    if (ms <= 0) return Promise.resolve();
    return new Promise((resolve,reject) => {
      const cancel = () => {clearTimeout(timer);cleanup();reject(failure('AbortError','Market data request cancelled.'));};
      const cleanup = () => {if (signal) signal.removeEventListener('abort',cancel);};
      const timer = setTimeout(() => {cleanup();resolve();},ms);
      if (signal) signal.addEventListener('abort',cancel,{once:true});
    });
  }

  async function request(url, fetchImpl, signal) {
    checkCancelled(signal);
    const controller = new AbortController();
    let interrupt;
    const interruption = new Promise((_,reject) => {interrupt=reject;});
    const cancel = () => {interrupt(failure('AbortError','Market data request cancelled.'));controller.abort();};
    const timer = setTimeout(() => {
      interrupt(failure('TimeoutError','Market data request timed out after 15 seconds.'));
      controller.abort();
    },REQUEST_TIMEOUT);
    if (signal) signal.addEventListener('abort',cancel,{once:true});
    try {
      return await Promise.race([interruption,(async () => {
        const response = await fetchImpl(url,{method:'GET',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',redirect:'error',signal:controller.signal});
        if (!response || !response.ok) throw new Error('Market data HTTP request failed' + (response && response.status ? ' ('+response.status+')' : '') + '.');
        if (typeof response.json !== 'function') throw new Error('Invalid market data response.');
        const payload = await response.json();
        if (!payload || payload.code !== '0' || !Array.isArray(payload.data)) throw new Error('OKX market data returned an error or invalid payload.');
        if (payload.data.length > 300) throw new Error('Market data page exceeds the requested limit.');
        return payload.data;
      })()]);
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener('abort',cancel);
    }
  }

  function numeric(value, name) {
    if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) throw new Error('Invalid candle '+name+'.');
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) throw new Error('Invalid candle '+name+'.');
    return number;
  }

  function candle(row) {
    if (!Array.isArray(row) || row.length < 9 || (row[8] !== '0' && row[8] !== '1')) throw new Error('Invalid candle row or confirmation flag.');
    const ts = numeric(row[0],'timestamp'), close = numeric(row[4],'close');
    if (!Number.isSafeInteger(ts) || ts % STEP !== 0 || Number.isNaN(new Date(ts).getTime())) throw new Error('Candle timestamp is not a valid UTC 2H opening.');
    return {ts,close,confirmed:row[8] === '1'};
  }

  function dailyPrices(prices) {
    const groups = new Map();
    for (const row of prices) {
      const start = Math.floor((row[0]+BEIJING)/DAY)*DAY-BEIJING;
      if (!groups.has(start)) groups.set(start,[]);
      groups.get(start).push(row);
    }
    const daily = [];
    for (const [start,rows] of groups) {
      if (rows.length === 12 && rows.every((row,i) => row[0] === start+i*STEP)) daily.push([start,rows[11][1]]);
    }
    return daily;
  }

  async function load(options) {
    const input = options || {};
    const base = new URL(input.baseUrl === undefined ? ALLOWED_BASE_URLS[0] : input.baseUrl);
    if (!ALLOWED_BASE_URLS.includes(base.origin) || base.username || base.password || base.pathname !== '/' || base.search || base.hash) {
      throw new Error('Only the listed official OKX HTTPS API origins are allowed.');
    }
    const days = input.days === undefined ? 90 : input.days;
    if (![90,365,1095].includes(days)) throw new Error('days must be 90, 365 or 1095.');
    const now = input.now instanceof Date ? input.now.getTime() : input.now === undefined ? Date.now() : input.now;
    if (typeof now !== 'number' || !Number.isSafeInteger(now) || now <= 0 || Number.isNaN(new Date(now).getTime())) throw new Error('now must be a valid epoch millisecond timestamp or Date.');
    if (input.onProgress !== undefined && typeof input.onProgress !== 'function') throw new Error('onProgress must be a function.');
    const fetchImpl = input.fetchImpl === undefined ? (typeof fetch === 'function' ? fetch.bind(globalThis) : null) : input.fetchImpl;
    if (typeof fetchImpl !== 'function') throw new Error('A browser with fetch support is required.');
    const since = now-days*DAY, maxRequests = Math.ceil(days*12/300)+2;
    const confirmed = new Map();
    let cursor, previousStart = 0, finished = false;
    checkCancelled(input.signal);
    for (let requests = 1; requests <= maxRequests; requests++) {
      await wait(Math.max(0,REQUEST_INTERVAL-(Date.now()-previousStart)),input.signal);
      checkCancelled(input.signal);
      const url = new URL('/api/v5/market/history-candles',base.origin);
      url.searchParams.set('instId','ETH-USDT-SWAP');
      url.searchParams.set('bar','2H');
      url.searchParams.set('limit','300');
      if (cursor !== undefined) url.searchParams.set('after',String(cursor));
      previousStart = Date.now();
      const page = await request(url.href,fetchImpl,input.signal);
      checkCancelled(input.signal);
      if (!page.length) {finished=true;break;}
      let oldest = Infinity;
      for (const row of page) {
        const value = candle(row);
        oldest = Math.min(oldest,value.ts);
        if (!value.confirmed) continue;
        if (confirmed.has(value.ts) && confirmed.get(value.ts) !== value.close) throw new Error('Conflicting confirmed candles share the same timestamp.');
        confirmed.set(value.ts,value.close);
      }
      if (cursor !== undefined && oldest >= cursor) throw new Error('Market data pagination did not move to older candles.');
      cursor = oldest;
      if (input.onProgress) input.onProgress({requests,maxRequests,candles:confirmed.size,oldestMs:oldest});
      checkCancelled(input.signal);
      if (oldest <= since) {finished=true;break;}
    }
    if (!finished) throw new Error('Market data pagination reached its bounded request limit before the selected interval was covered.');
    const prices = Array.from(confirmed,([ts,close]) => [ts,close]).filter(row => row[0] >= since && row[0]+STEP <= now).sort((a,b) => a[0]-b[0]);
    if (!prices.length) throw new Error('No confirmed 2H candles are available in the selected interval.');
    checkCancelled(input.signal);
    return {symbol:'ETH-USDT-SWAP',prices,daily_prices:dailyPrices(prices),updated_at:prices[prices.length-1][0]+STEP};
  }

  return {load,ALLOWED_BASE_URLS};
});

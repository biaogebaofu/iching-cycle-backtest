/* Copyright (c) 2026 biaogebaofu. All rights reserved. See LICENSE. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const market = require('../assets/market-data.js');
const DAY=86400000, STEP=7200000;
const NOW=Date.parse('2026-10-02T00:00:00+08:00');
const row=(ts,close=100,flag='1') => [String(ts),'100','110','90',String(close),'0','0','0',flag];
const response=(data,extra={}) => ({ok:true,status:200,json:async () => ({code:'0',data,...extra})});
const boundary=() => row(NOW-90*DAY-STEP);

test('browser UMD publishes a small API and its immutable official allowlist', () => {
  const browser={URL,Date,AbortController,setTimeout,clearTimeout};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/market-data.js'),'utf8'),browser);
  assert.equal(typeof browser.CycleMarket.load,'function');
  assert.equal(browser.CycleMarket.ALLOWED_BASE_URLS.length,3);
  assert.ok(Object.isFrozen(market.ALLOWED_BASE_URLS));
});

test('invalid origin, path, credentials, query, port and interval never make requests', async () => {
  let calls=0;
  const fetchImpl=async () => {calls++;return response([]);};
  for (const baseUrl of ['http://openapi.okx.com','https://openapi.okx.com.evil.example','https://www.okx.com',
    'https://openapi.okx.com/proxy','https://user:secret@openapi.okx.com','https://openapi.okx.com?key=x','https://openapi.okx.com#x','https://openapi.okx.com:8443']) {
    await assert.rejects(market.load({baseUrl,now:NOW,fetchImpl}));
  }
  for (const days of [1,89,366,'90',Infinity]) await assert.rejects(market.load({days,now:NOW,fetchImpl}));
  assert.equal(calls,0);
});

test('all official origins use only the fixed public GET endpoint without credentials or redirects', async () => {
  for (const baseUrl of market.ALLOWED_BASE_URLS) {
    await market.load({baseUrl,now:NOW,fetchImpl:async (url,options) => {
      const parsed=new URL(url);
      assert.equal(parsed.origin,baseUrl);
      assert.equal(parsed.pathname,'/api/v5/market/history-candles');
      assert.equal(parsed.searchParams.get('instId'),'ETH-USDT-SWAP');
      assert.equal(parsed.searchParams.get('bar'),'2H');
      assert.equal(parsed.searchParams.get('limit'),'300');
      assert.equal(options.method,'GET');
      assert.equal(options.credentials,'omit');
      assert.equal(options.cache,'no-store');
      assert.equal(options.referrerPolicy,'no-referrer');
      assert.equal(options.redirect,'error');
      assert.ok(options.signal instanceof AbortSignal);
      return response([row(NOW-STEP),boundary()]);
    }});
  }
});

test('confirmed rows are deduplicated, sorted and filtered to the requested interval and complete candles', async () => {
  const result=await market.load({now:NOW,fetchImpl:async () => response([
    row(NOW-2*STEP,102),row(NOW-STEP,103),row(NOW-2*STEP,102),
    row(NOW,104,'0'),row(NOW+STEP,105),boundary(),row(NOW-3*STEP,101,'0')])});
  assert.deepEqual(result.prices,[[NOW-2*STEP,102],[NOW-STEP,103]]);
  assert.equal(result.symbol,'ETH-USDT-SWAP');
  assert.equal(result.updated_at,NOW);
  assert.deepEqual(result.daily_prices,[]);
});

test('pagination uses the oldest timestamp and spaces sequential request starts at least 334 ms apart', async () => {
  const starts=[],progress=[];
  let count=0;
  const result=await market.load({now:NOW,onProgress:value=>progress.push(value),fetchImpl:async url => {
    starts.push(Date.now());
    count++;
    const after=new URL(url).searchParams.get('after');
    if (count===1) {assert.equal(after,null);return response([row(NOW-STEP,102),row(NOW-2*STEP,101)]);}
    assert.equal(after,String(NOW-2*STEP));
    return response([row(NOW-2*STEP,101),row(NOW-3*STEP,100),boundary()]);
  }});
  assert.equal(count,2);
  assert.ok(starts[1]-starts[0]>=330);
  assert.equal(result.prices.length,3);
  assert.deepEqual(progress.map(p=>p.requests),[1,2]);
  assert.equal(progress[0].maxRequests,6);
  assert.equal(progress[1].oldestMs,NOW-90*DAY-STEP);
});

test('daily closes require exactly 12 consecutive confirmed candles covering a full Beijing day', async () => {
  const first=NOW-3*DAY;
  const bars=Array.from({length:36},(_,i)=>row(first+i*STEP,100+i));
  bars[15][8]='0';
  const result=await market.load({now:NOW,fetchImpl:async () => response([...bars.reverse(),boundary()])});
  assert.deepEqual(result.daily_prices,[[first,111],[first+2*DAY,135]]);
  assert.equal(result.prices.length,35);
});

test('malformed rows, confirmation flags, values and conflicting duplicates fail instead of becoming prices', async () => {
  for (const invalid of [[],row(NOW-STEP,0),row(NOW-STEP,NaN),row(NOW-STEP,Infinity),row(NOW-STEP+1),
    row(NOW-STEP,100,'x'),row(NOW-STEP,true),row(0),row(NaN),row(Infinity),[String(NOW-STEP),'100']]) {
    await assert.rejects(market.load({now:NOW,fetchImpl:async () => response([invalid,boundary()])}));
  }
  await assert.rejects(market.load({now:NOW,fetchImpl:async () => response([row(NOW-STEP,100),row(NOW-STEP,101),boundary()])}),/Conflicting/);
});

test('HTTP, API, JSON and network errors do not retry or fall back to another source', async () => {
  const cases=[async()=>({ok:false,status:403}),async()=>response([],{code:'50011'}),
    async()=>({ok:true,json:async()=>{throw new SyntaxError('bad JSON');}}),async()=>{throw new TypeError('network unavailable');}];
  for (const fetchImpl of cases) {
    let count=0;
    await assert.rejects(market.load({now:NOW,fetchImpl:async(...args)=>{count++;return fetchImpl(...args);}}));
    assert.equal(count,1);
  }
  await assert.rejects(market.load({now:NOW,fetchImpl:async()=>response([])}),/No confirmed/);
});

test('cancellation works before fetching and during a fetch even if a mock ignores its signal', async () => {
  const first=new AbortController();first.abort();let calls=0;
  await assert.rejects(market.load({now:NOW,signal:first.signal,fetchImpl:async()=>{calls++;return response([]);}}),{name:'AbortError'});
  assert.equal(calls,0);
  const next=new AbortController();
  const pending=market.load({now:NOW,signal:next.signal,fetchImpl:async()=>{calls++;return new Promise(()=>{});}});
  await Promise.resolve();await Promise.resolve();
  next.abort();
  await assert.rejects(pending,{name:'AbortError'});
  assert.equal(calls,1);
});

test('cancellation during the between-page rate-limit wait prevents another request', async () => {
  const controller=new AbortController();
  let calls=0;
  const pending=market.load({now:NOW,signal:controller.signal,onProgress:()=>setTimeout(()=>controller.abort(),5),
    fetchImpl:async()=>{calls++;return response([row(NOW-STEP)]);}});
  await assert.rejects(pending,{name:'AbortError'});
  assert.equal(calls,1);
});

test('a stalled request has a finite timeout and aborts the fetch without retry', async t => {
  t.mock.timers.enable({apis:['setTimeout']});
  let calls=0,requestSignal;
  const pending=market.load({now:NOW,fetchImpl:async(_url,options)=>{calls++;requestSignal=options.signal;return new Promise(()=>{});}});
  await Promise.resolve();await Promise.resolve();
  t.mock.timers.tick(15000);
  await assert.rejects(pending,{name:'TimeoutError'});
  assert.equal(calls,1);
  assert.equal(requestSignal.aborted,true);
});

test('repeating pages are rejected instead of looping indefinitely', async () => {
  let calls=0;
  await assert.rejects(market.load({now:NOW,fetchImpl:async()=>{calls++;return response([row(NOW-STEP)]);}}),/pagination did not move/);
  assert.equal(calls,2);
});

test('the request budget prevents unbounded tiny-page pagination', async () => {
  let calls=0;
  await assert.rejects(market.load({now:NOW,fetchImpl:async()=>{calls++;return response([row(NOW-calls*STEP)]);}}),/bounded request limit/);
  assert.equal(calls,6);
});

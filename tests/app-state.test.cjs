/* Copyright (c) 2026 biaogebaofu. All rights reserved. See LICENSE. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const realCore = require('../assets/core.js');
const html = fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const source = fs.readFileSync(path.join(__dirname,'../assets/app.js'),'utf8');
const STEP = 7200000, DAY = 86400000;

// Only DOM operations used by the real app. Event handlers and state transitions
// are executed from app.js; no application logic is reproduced here.
class Element {
  constructor() {this.children=[];this.handlers={};this.style={};this._text='';this.value='';this.disabled=false;this.checked=false;this.hidden=false;}
  set textContent(value) {this._text=String(value);this.children=[];}
  get textContent() {return this._text+this.children.map(child=>child.textContent).join('');}
  append(...children) {this.children.push(...children);}
  replaceChildren(...children) {this._text='';this.children=children;}
  addEventListener(type,handler) {(this.handlers[type] ||= []).push(handler);}
  emit(type) {return Promise.all((this.handlers[type] || []).map(handler=>handler({type,target:this})));}
}

function fixture(closeMs=Date.parse('2026-10-02T10:00:00+08:00')) {
  return {symbol:'ETH-USDT-SWAP',prices:Array.from({length:30},(_,i)=>[closeMs-(30-i)*STEP,100+i]),daily_prices:[],updated_at:closeMs};
}

function harness() {
  const elements={}, requests=[], charts=[], intervals=[], calls={calendar:0,backtest:[]};
  for (const match of html.matchAll(/<[a-z][^>]*\bid="([^"]+)"[^>]*>/gi)) {
    const node=new Element(), tag=match[0];
    for (const name of ['value','min','max']) node[name]=new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1] || '';
    for (const name of ['disabled','checked','hidden']) node[name]=new RegExp(`\\b${name}(?:\\s|>)`).test(tag);
    elements[match[1]]=node;
  }
  for (const match of html.matchAll(/<select\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)) {
    const options=[...match[2].matchAll(/<option\b[^>]*\bvalue="([^"]*)"[^>]*>/g)];
    elements[match[1]].value=(options.find(option=>/\bselected(?:\s|>)/.test(option[0])) || options[0])[1];
  }
  const details=new Element();
  const core={...realCore,calendarState(...args){calls.calendar++;return realCore.calendarState(...args);},
    backtest(...args){calls.backtest.push(args);return realCore.backtest(...args);}};
  const market={load(options){return new Promise((resolve,reject)=>requests.push({options,resolve,reject}));}};
  const window={CycleCore:core,CycleMarket:market,innerWidth:1200,addEventListener(){},echarts:{init(){
    const chart={disposed:false,options:[],setOption(value){this.options.push(value);},resize(){},dispose(){this.disposed=true;}};
    charts.push(chart);return chart;
  }}};
  vm.runInNewContext(source,{window,document:{getElementById:id=>elements[id],createElement:()=>new Element(),querySelector:()=>details},
    Date,AbortController,setInterval:callback=>{intervals.push(callback);return intervals.length;}},{filename:'app.js'});
  assert.equal(elements.fatalError.hidden,true,elements.fatalError.textContent);
  return {elements,requests,charts,intervals,calls,emit:(id,type='click')=>elements[id].emit(type),
    async eligible(){elements.jurisdiction.value='eligible';await elements.jurisdiction.emit('change');elements.eligibilityAck.checked=true;await elements.eligibilityAck.emit('change');}};
}

test('startup makes no market request and keeps all model research hidden', () => {
  const h=harness();
  assert.equal(h.requests.length,0);
  assert.equal(h.calls.calendar,0);
  assert.equal(h.elements.researchOutput.hidden,true);
  assert.equal(h.elements.connectMarket.disabled,true);
  assert.equal(h.elements.clearMarket.disabled,true);
  h.intervals.forEach(callback=>callback());
  assert.equal(h.requests.length,0);
  assert.equal(h.calls.calendar,0);
});

test('both eligible jurisdiction and acknowledgement are required even for dispatched button events', async () => {
  const h=harness();
  for (const [jurisdiction,ack] of [['',false],['eligible',false],['mainland',true],['restricted',true],['',true]]) {
    h.elements.jurisdiction.value=jurisdiction;h.elements.eligibilityAck.checked=ack;
    await h.emit('jurisdiction','change');await h.emit('connectMarket');
    assert.equal(h.requests.length,0);
    assert.equal(h.elements.connectMarket.disabled,true);
    assert.equal(h.elements.researchOutput.hidden,true);
  }
  await h.eligible();
  assert.equal(h.elements.connectMarket.disabled,false);
  const pending=h.emit('connectMarket');
  assert.equal(h.requests.length,1);
  assert.equal(h.requests[0].options.baseUrl,h.elements.apiRegion.value);
  assert.equal(h.requests[0].options.days,365);
  h.requests[0].resolve(fixture());await pending;
  assert.equal(h.elements.researchOutput.hidden,false);
  assert.equal(h.calls.calendar,1);
});

test('cancelled pending data cannot publish after a late completion', async () => {
  const h=harness();await h.eligible();
  const pending=h.emit('connectMarket');
  const request=h.requests[0];
  await h.emit('clearMarket');
  assert.equal(request.options.signal.aborted,true);
  const status=h.elements.connectionStatus.textContent;
  request.options.onProgress({requests:99});
  assert.equal(h.elements.connectionStatus.textContent,status);
  request.resolve(fixture());await pending;
  assert.equal(h.elements.researchOutput.hidden,true);
  assert.equal(h.elements.historyMeta.textContent,'');
  assert.equal(h.elements.startDate.value,'');
  assert.equal(h.elements.endDate.value,'');
  assert.equal(h.calls.calendar,0);
  assert.equal(h.elements.connectionStatus.textContent,status);
});

test('revoking acknowledgement or changing jurisdiction clears published results and disposes charts', async () => {
  for (const revoke of ['ack','jurisdiction']) {
    const h=harness();await h.eligible();
    const pending=h.emit('connectMarket');h.requests[0].resolve(fixture());await pending;
    h.elements.testMode.value='bias';await h.emit('testMode','change');await h.emit('runBacktest');
    assert.ok(h.elements.testRows.children.length>0);
    assert.ok(h.elements.scheduleRows.children.length>0);
    assert.ok(h.charts.length>0);
    if (revoke==='ack') {h.elements.eligibilityAck.checked=false;await h.emit('eligibilityAck','change');}
    else {h.elements.jurisdiction.value='mainland';await h.emit('jurisdiction','change');}
    assert.equal(h.elements.researchOutput.hidden,true);
    for (const id of ['historyMeta','testHead','testRows','testMetrics','scheduleRows','timeline','currentDirection','nextDirection']) {
      assert.equal(h.elements[id].textContent,'',id);
      assert.equal(h.elements[id].children.length,0,id);
    }
    assert.ok(h.charts.every(chart=>chart.disposed));
    assert.equal(h.elements.connectMarket.disabled,true);
    const calls=h.calls.backtest.length;await h.emit('runBacktest');
    assert.equal(h.calls.backtest.length,calls);
  }
});

test('revoking eligibility aborts pending work and a stale rejection cannot replace the restriction message', async () => {
  const h=harness();await h.eligible();
  const pending=h.emit('connectMarket');
  h.elements.jurisdiction.value='mainland';await h.emit('jurisdiction','change');
  const status=h.elements.connectionStatus.textContent;
  assert.equal(h.requests[0].options.signal.aborted,true);
  h.requests[0].reject(new Error('late network failure'));await pending;
  assert.equal(h.elements.connectionStatus.textContent,status);
  assert.equal(h.elements.researchOutput.hidden,true);
  assert.equal(h.elements.connectMarket.disabled,true);
});

test('old finally cannot reenable controls or publish while a newer request is pending', async () => {
  for (const finish of ['resolve','reject']) {
    const h=harness();await h.eligible();
    const old=h.emit('connectMarket');await h.emit('clearMarket');
    const current=h.emit('connectMarket');
    assert.equal(h.requests.length,2);
    const status=h.elements.connectionStatus.textContent;
    if (finish==='resolve') h.requests[0].resolve(fixture());
    else h.requests[0].reject(new Error('stale failure'));
    await old;
    assert.equal(h.elements.connectMarket.disabled,true);
    assert.equal(h.elements.apiRegion.disabled,true);
    assert.equal(h.elements.historyDays.disabled,true);
    assert.equal(h.elements.researchOutput.hidden,true);
    assert.equal(h.elements.connectionStatus.textContent,status);
    h.requests[1].resolve(fixture());await current;
    assert.equal(h.elements.researchOutput.hidden,false);
    assert.equal(h.elements.connectMarket.disabled,false);
    assert.equal(h.elements.apiRegion.disabled,false);
    assert.equal(h.elements.historyDays.disabled,false);
  }
});

test('a candle closing at Beijing midnight sets the end date and maximum to its closing day', async () => {
  const h=harness();await h.eligible();
  const closeMs=Date.parse('2026-10-02T00:00:00+08:00');
  const pending=h.emit('connectMarket');h.requests[0].resolve(fixture(closeMs));await pending;
  assert.equal(h.elements.endDate.value,'2026-10-02');
  assert.equal(h.elements.endDate.max,'2026-10-02');
  assert.equal(h.elements.startDate.max,'2026-10-02');
  h.elements.testMode.value='bias';await h.emit('testMode','change');await h.emit('runBacktest');
  assert.equal(h.calls.backtest.length,1);
  const parameters=h.calls.backtest[0][1];
  assert.equal(parameters.endMs,closeMs+DAY-1);
  assert.ok(parameters.endMs>=closeMs);
  assert.ok(h.elements.testRows.children.length>0);
});

/* Copyright (c) 2026 biaogebaofu. All rights reserved. See LICENSE. */
'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const core = window.CycleCore;
  const history = window.CYCLE_HISTORY;
  const DAY = 86400000, TWO_HOURS = 7200000;
  const formatTime = (value, dateOnly = false) => core.formatBeijing(typeof value === 'string' ? Date.parse(value) : value).slice(0, dateOnly ? 10 : 16).replace('T', ' ');
  const calcBias = date => core.calcBias(date);
  const percentage = value => value == null ? '—' : (100 * value).toFixed(2) + '%';
  const price = value => Number(value).toLocaleString('en-US', {maximumFractionDigits:2});
  const directionName = direction => direction === 1 ? '只多 / 可空仓' : '只空 / 可空仓';
  const charts = [];

  function row(values) {
    const tr = document.createElement('tr');
    values.forEach(value => { const td = document.createElement('td'); td.textContent = value; tr.append(td); });
    return tr;
  }
  function header(values) {
    const tr = document.createElement('tr');
    values.forEach(value => { const th = document.createElement('th'); th.scope = 'col'; th.textContent = value; tr.append(th); });
    $('testHead').replaceChildren(tr);
  }
  function renderCalendar() {
    const state = core.calendarState(Date.now());
    $('clock').textContent = formatTime(Date.now());
    $('clock').dateTime = new Date().toISOString();
    for (const [prefix, phase] of [['current', state.current], ['next', state.next]]) {
      $(prefix + 'Card').className = 'phase-card ' + (prefix === 'next' ? 'next ' : '') + (phase.direction === 1 ? 'long' : 'short');
      $(prefix + 'Direction').textContent = directionName(phase.direction);
    }
    $('currentUntil').textContent = '持续至 ' + formatTime(state.current.end_exclusive) + '（不含）';
    $('currentOrigin').textContent = '本阶段始于 ' + formatTime(state.current.start);
    $('nextStart').textContent = formatTime(state.next.start) + ' 起生效';
    $('nextEnd').textContent = '持续至 ' + formatTime(state.next.end_exclusive) + '（不含）';
    $('scheduleRows').replaceChildren(...state.table.intervals.map(p => row([formatTime(p.start), formatTime(p.end_exclusive), directionName(p.direction), formatTime(p.band_center)])));
    $('timeline').replaceChildren(...state.table.intervals.map(p => {
      const span = document.createElement('span');
      span.className = p.direction === 1 ? 'long' : 'short';
      span.style.flex = (Date.parse(p.end_exclusive) - Date.parse(p.start)) + ' 1 0';
      span.title = formatTime(p.start) + ' → ' + formatTime(p.end_exclusive) + ' · ' + directionName(p.direction);
      span.textContent = p.direction === 1 ? '多' : '空';
      return span;
    }));
  }

  // Original chart renderer; chart signals retain the supplied source formula.
  function signalChartOption(points, predCount, isDaily, isBars) {
  const step = isDaily ? DAY : TWO_HOURS;
  const times = points.map(k => k[0]), prices = points.map(k => k[1]);
  const last = times[times.length - 1];
  for (let i = 1; i <= predCount; i++) {times.push(last + i * step); prices.push(null);}
  const labels = times.map(t => formatTime(t)), biases = times.map(t => calcBias(new Date(t)));
  const names = isBars ? ['ETH价格','偏多信号','偏空信号','中性信号'] : ['ETH价格','做多区间','做空区间','Bias'];
  return {
    animation:false, backgroundColor:'transparent', textStyle:{fontFamily:'Segoe UI, Microsoft YaHei UI, sans-serif'},
    legend:{data:names, top:4, type:'scroll', textStyle:{color:'#bac7d7',fontSize:11}, itemWidth:16, itemHeight:8},
    grid:{left:window.innerWidth<600?46:62,right:window.innerWidth<600?30:42,top:65,bottom:75},
    tooltip:{trigger:'axis',confine:true,axisPointer:{type:'cross'},backgroundColor:'#1b2634',borderColor:'#39495d',textStyle:{color:'#e5edf6',fontSize:12},formatter:items => {
      if (!items.length) return '';
      const i = items[0].dataIndex;
      return labels[i] + (isDaily ? '（北京时间，自然日）<br>' : '（北京时间，K线开始）<br>') +
        (prices[i] === null ? '未收盘 / 未来：暂无实际价格' : (isDaily ? '当日收盘：' : '2小时后收盘：') + Number(prices[i]).toFixed(2) + ' USDT') +
        (isDaily ? '<br>当日00:00信号：' : '<br>原公式信号：') + biases[i].toFixed(4) + '<br>' + (biases[i] > .1 ? '偏多' : biases[i] < -.1 ? '偏空' : '中性');
    }},
    xAxis:{type:'category',data:labels,axisLine:{lineStyle:{color:'#334254'}},axisTick:{show:false},axisLabel:{color:'#899aaf',fontSize:10,hideOverlap:true,interval:Math.max(0,Math.floor(times.length/(window.innerWidth<600?3:7))),formatter:value => isDaily||times.length>1080?value.slice(0,10):value.slice(5,10)+'\n'+value.slice(11,16)}},
    yAxis:[
      {type:'value',name:'ETH · USDT',scale:true,axisLabel:{color:'#7dafff',fontSize:11},nameTextStyle:{color:'#97a7ba',fontSize:11},splitLine:{lineStyle:{color:'#26313f',type:'dashed'}}},
      {type:'value',name:isDaily?'日线信号':'信号值',min:-1,max:1,axisLabel:{color:'#97a7ba',fontSize:10},nameTextStyle:{color:'#97a7ba',fontSize:11},splitLine:{show:false}}
    ],
    dataZoom:[{type:'inside',zoomOnMouseWheel:'ctrl',moveOnMouseWheel:false},{type:'slider',bottom:12,height:20,borderColor:'#334254',backgroundColor:'#0f1721',fillerColor:'rgba(125,175,255,.08)',textStyle:{color:'#899aaf',fontSize:10}}],
    series:[
      {name:names[0],type:'line',yAxisIndex:0,data:prices,z:5,showSymbol:false,connectNulls:false,itemStyle:{color:'#58a6ff'},lineStyle:{width:1.5,color:'#58a6ff'},markLine:predCount?{silent:true,symbol:'none',label:{formatter:'实际价格截止',color:'#d9ad59',fontSize:10},lineStyle:{color:'#d9ad59',type:'dashed'},data:[{xAxis:points.length-1}]}:undefined},
      {name:names[1],type:isBars?'bar':'line',yAxisIndex:1,data:biases.map(b=>b>.1?b:null),barGap:'-100%',barMaxWidth:12,showSymbol:false,connectNulls:false,itemStyle:{color:'#f85149'},lineStyle:{width:2,color:'#f85149'},areaStyle:isBars?undefined:{color:'rgba(248,81,73,.15)'}},
      {name:names[2],type:isBars?'bar':'line',yAxisIndex:1,data:biases.map(b=>b<-.1?b:null),barGap:'-100%',barMaxWidth:12,showSymbol:false,connectNulls:false,itemStyle:{color:'#3fb950'},lineStyle:{width:2,color:'#3fb950'},areaStyle:isBars?undefined:{color:'rgba(63,185,80,.15)'}},
      {name:names[3],type:isBars?'bar':'line',yAxisIndex:1,data:isBars?biases.map(b=>b>=-.1&&b<=.1?b:null):biases,barGap:'-100%',barMaxWidth:12,showSymbol:false,itemStyle:{color:isBars?'#8b98a7':'#58a6ff'},lineStyle:{width:1,color:'rgba(88,166,255,.5)'},
        markArea:predCount?{silent:true,itemStyle:{color:'rgba(232,160,0,.07)'},label:{color:'#d9ad59',fontSize:10,formatter:'未来信号 · 无实际价格'},data:[[{xAxis:points.length},{xAxis:times.length-1}]]}:undefined,
        markLine:{silent:true,symbol:'none',data:[{yAxis:.1,lineStyle:{color:'#f85149',type:'dashed'},label:{formatter:'+0.1',color:'#f85149',fontSize:10}},{yAxis:-.1,lineStyle:{color:'#3fb950',type:'dashed'},label:{formatter:'−0.1',color:'#3fb950',fontSize:10}}]}}
    ]
  };
}


  function renderCharts() {
    if (!window.echarts) { $('chartStatus').textContent = '图表组件未加载。日历与回测仍可使用；离线时请检查完整解压了 assets 文件夹。'; return; }
    const range = $('range1').value, future = Number($('predDays').value);
    const first = range === 'all' ? history.prices : history.prices.slice(-Number(range) * 12);
    const daily = history.daily_prices.filter(p => p[0] >= first[0][0]);
    const recent = history.prices.slice(-Number($('range2').value) * 12);
    const last = history.prices[history.prices.length - 1][0];
    const dailyFuture = future ? Math.floor((last + future * DAY - daily[daily.length - 1][0]) / DAY) : 0;
    const options = [signalChartOption(first, future * 12, false, false), signalChartOption(daily, dailyFuture, true, true), signalChartOption(recent, future * 12, false, true)];
    ['chart1', 'chartDaily', 'chart2'].forEach((id, i) => {
      if (!charts[i]) charts[i] = window.echarts.init($(id));
      charts[i].setOption(options[i], {notMerge:true});
    });
    $('chartStatus').textContent = '价格取每根 K 线收盘值；横轴为开盘时间。日线信号在北京时间 00:00 独立计算。拖动图底滑条缩放。';
  }
  function metrics(stats) {
    const labels = [['已完成样本', String(stats.samples)], ['扣成本胜率', percentage(stats.winRate)], ['单样本平均', percentage(stats.meanReturn)], ['单样本中位数', percentage(stats.medianReturn)]];
    $('testMetrics').replaceChildren(...labels.map(([label, value]) => {
      const card = document.createElement('div'); card.className = 'metric';
      const title = document.createElement('span'), result = document.createElement('strong');
      title.textContent = label; result.textContent = value; card.append(title, result); return card;
    }));
  }
  function runBacktest() {
    const start = $('startDate').value, end = $('endDate').value;
    const costText = $('costBps').value;
    const costBps = Number(costText);
    const startMs = Date.parse(start + 'T00:00:00+08:00');
    const endMs = Date.parse(end + 'T00:00:00+08:00') + DAY - 1;
    if (!start || !end || startMs > endMs || !Number.isFinite(startMs) || !Number.isFinite(endMs) || costText === '' || !Number.isFinite(costBps) || costBps < 0 || costBps > 1000) {
      $('testStatus').textContent = '请填写有效起止日期，起点不晚于终点；单边成本需为 0～1000 bps。'; return;
    }
    const button = $('runBacktest'); button.disabled = true;
    try {
      const parameters = {startMs, endMs, costBps};
      const mode = $('testMode').value;
      if (mode === 'midpoint') {
        const result = core.midpointBacktest(history.prices, parameters);
        metrics(result.combined);
        header(['入场（北京时间）', '退出 / 估值（北京时间）', '方向', '入场 → 出场价', '毛收益', '扣已发生成本', '状态']);
        $('testRows').replaceChildren(...result.trades.map(t => row([formatTime(t.entryMs), formatTime(t.exitMs), t.direction === 1 ? '多' : '空', price(t.entryPrice) + ' → ' + price(t.exitPrice), percentage(t.grossReturn), percentage(t.netReturn), t.completed ? '已完成' : '未完成 · 快照估值'])));
        $('methodNote').textContent = '方向日历基准：红高带中点做空，绿深带中点做多；在中点向后对齐的 2H K 线收盘入场，持有至下一相反事件。起点前仓位不带入。未完成段只按截止快照估值，不计入上方完成样本统计。';
        $('testStatus').textContent = '已完成 ' + result.combined.samples + ' 段，未完成 ' + result.summary.openTrades + ' 段，缺失事件跳过 ' + result.summary.skippedEvents + ' 项。往返成本 ' + (2 * costBps).toFixed(1) + ' bps；结果为单段线性收益统计，不是资金曲线。';
      } else {
        const result = core.backtest(history.prices, parameters);
        $('testMetrics').replaceChildren();
        header(['持有时长', '方向', '样本数', '扣成本胜率', '平均毛收益', '扣成本平均', '扣成本中位数']);
        const rows = [];
        result.horizons.forEach(h => {
          [['合计',h.combined], ['多',h.long], ['空',h.short]].forEach(([name,s]) => rows.push(row([h.hours + ' 小时',name,s.samples,percentage(s.winRate),percentage(s.meanGrossReturn),percentage(s.meanReturn),percentage(s.medianReturn)])));
        });
        $('testRows').replaceChildren(...rows);
        $('methodNote').textContent = '原 Bias 固定持有：每根 2H K 线开始时算信号，Bias > +0.1 为多、< −0.1 为空；该根收盘入场，持有固定时长后按收盘退出。样本会重叠，不能累乘为账户收益。';
        $('testStatus').textContent = '往返成本 ' + (2 * costBps).toFixed(1) + ' bps；缺口跳过 ' + result.summary.skippedGaps + ' 个持有窗口。仅统计区间内已有退出价格的完整样本。不同持有时长分别统计。';
      }
    } catch (error) { $('testStatus').textContent = '回测无法完成：' + error.message; }
    finally { button.disabled = false; }
  }
  try {
    if (!core || !history || !history.prices.length) throw new Error('资源不完整，请完整解压官方离线包后打开 index.html。');
    const last = history.prices[history.prices.length - 1];
    $('historyMeta').textContent = history.symbol + ' · 29,473 根 2H K 线 · 快照截至 ' + formatTime(history.updated_at) + ' · 最后收盘 ' + price(last[1]) + ' USDT';
    $('startDate').value = formatTime(history.prices[0][0], true);
    $('startDate').min = $('endDate').min = $('startDate').value;
    $('startDate').max = $('endDate').max = formatTime(history.updated_at, true);
    renderCalendar(); renderCharts(); runBacktest();
    setInterval(() => { $('clock').textContent = formatTime(Date.now()); }, 1000);
    setInterval(renderCalendar, 60000);
    ['range1','range2','predDays'].forEach(id => $(id).addEventListener('change', renderCharts));
    $('redrawCharts').addEventListener('click', renderCharts);
    $('runBacktest').addEventListener('click', runBacktest);
    $('testMode').addEventListener('change', runBacktest);
    const resize = () => charts.forEach(chart => chart.resize());
    window.addEventListener('resize', resize);
    document.querySelector('details.panel').addEventListener('toggle', resize);
    if (window.ResizeObserver) {
      const observer = new ResizeObserver(resize);
      ['chart1','chartDaily','chart2'].forEach(id => observer.observe($(id)));
    }
  } catch (error) { $('fatalError').hidden = false; $('fatalError').textContent = error.message; }
})();

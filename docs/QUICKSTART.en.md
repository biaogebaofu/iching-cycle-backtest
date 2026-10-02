# Quick start: no programming required

[Project overview](../README.en.md) · [中文](QUICKSTART.zh-CN.md) · [Illustrated browser guide (Chinese)](https://biaogebaofu.github.io/iching-cycle-backtest/docs/guide.html)

## 1. Recommended: open the website

Open [I Ching Cycle Calendar & Backtest](https://biaogebaofu.github.io/iching-cycle-backtest/).

Open it in a browser on a computer, phone, or tablet. Registration, a trading account, and programming tools are unnecessary. Your phone browser may offer Add to Home Screen as a shortcut; network access is still required when the page needs it.

![Desktop overview of the current and next direction-calendar phases and the historical chart](images/01-overview.png)

Start with the two cards at the top. “当前日历阶段” is the current phase; “下一阶段” is the next one. “只多 / 可空仓” means long-only or flat under the rule, and “只空 / 可空仓” means short-only or flat. Read “持续至 …（不含）” as lasting until, but not including, the stated end time. These labels are model outputs, not instructions to trade.

All dates are displayed in **Beijing time, UTC+08:00**, even if you live elsewhere. The current phase is calculated from your device clock, so keep that clock accurate. The price snapshot is separate: its final candle closes at **2026-09-15 10:00 Beijing time**, and it does not update automatically.

The interface is mainly Chinese. The labels below match the actual buttons and fields so you can use it alongside this English guide.

## 2. Choose what the charts display

![Chart range and future-signal controls with the daily and recent 2H charts expanded](images/02-chart-controls.png)

| Chinese control | Meaning and use |
| --- | --- |
| 图1 / 日线范围 | Chart 1 / daily range. Choose “全部历史” (all history) or a recent range. This controls the first 2H chart and the daily chart; the default is “最近1年” (last year). |
| 图2范围 | Chart 2 range. Select a shorter recent period for the second 2H chart; the default is “最近1个月” (last month). |
| 未来信号 | Future signals. Choose “不展示” (hide), 30 days, 1 year, 3 years, or 5 years. This extends the time-rule signal only; future prices remain blank. |
| 重绘图表 | Redraw charts using the selected display settings. |
| 展开日线与最近 2H 图表 | Expand the daily and recent 2H charts below the main chart. Click it again to collapse them. |

Use the slider below a chart to zoom into a smaller period. Changing a chart range does **not** change the backtest dates. The blue price line stops at the historical cutoff; a future signal is not a forecast of that line.

The original bias charts use red for a long bias and green for a short bias. Their 2H horizontal axis shows the candle's **opening** time, while the price is its close two hours later. The daily chart uses the final closing price of each complete Beijing calendar day; its daily signal is calculated independently at 00:00 Beijing time.

## 3. Set the backtest period and costs

Go to “回测研究” (backtest research), either by scrolling or using the navigation link at the top.

| Chinese field or button | What to enter or expect |
| --- | --- |
| 回测口径 | Analysis method. Start with “方向日历 · 中点切换基准” (direction-calendar midpoint baseline), then examine “原 Bias · 固定持有统计” (original bias with fixed holding periods) separately. |
| 起始日期（北京时间） | Start date in Beijing time. The default, 2019-12-25, covers the full history. Positions opened before your chosen start are not carried in. |
| 结束日期（含） | Inclusive end date. The whole selected Beijing day is included, but results still require available historical prices. A later date does not add new market data. |
| 单边成本（bps） | Combined fees and slippage per side, in basis points. Enter a value from 0 to 1000. One bps is 0.01%. |
| 运行回测 | Run the selected method with these dates and costs. Run it again after changing the settings. |

For a first comparison, enter **5** for “单边成本（bps）” and click “运行回测”. This means 0.05% per side and a 0.10% deduction for a completed round trip. Five bps is an example, not a verified cost for any exchange or account. The default of 0 reproduces the original gross-return statistics. Funding fees, leverage, margin, and liquidations are excluded.

## 4. Read the direction-calendar midpoint results

![Full-history midpoint backtest with 5 bps entered as the per-side cost](images/03-midpoint-backtest.png)

The default method, “方向日历 · 中点切换基准”, takes a red high-band midpoint as a short event and a green deep-band midpoint as a long event. It enters at the close of the first 2H candle whose opening is at or after the midpoint, then exits at the close associated with the next opposite event. This mapping differs from the original red-long / green-short bias chart.

Read the four result cards as follows:

| Result label | Interpretation |
| --- | --- |
| 已完成样本 | Number of completed research segments. |
| 扣成本胜率 | Percentage of completed segments with positive return after the entered costs. |
| 单样本平均 | Arithmetic average return after costs per completed segment. |
| 单样本中位数 | Middle return after costs among completed segments. |

The screenshot uses 5 bps per side: 16 completed segments, a 75.00% after-cost win rate, an arithmetic mean return of −28.27%, and a median of 25.76%. A small number of large losses can pull down the mean; one short segment in the image has an after-cost linear return of −810.01%. This figure is a price-ratio research statistic, not a simulation of account equity or realizable account losses. The model does not simulate margin requirements or liquidation, so a high historical win rate alone does not establish profitability.

In the table, “入场（北京时间）” is entry time; “退出 / 估值（北京时间）” is exit or marking time. “入场 → 出场价” shows the two prices. “毛收益” is before costs; “扣已发生成本” is after costs already incurred. “已完成” identifies a completed segment. A row marked **“未完成 · 快照估值”** is unfinished and valued at the last available close up to the selected cutoff. It deducts only the entry-side cost and is excluded from the four completed-sample cards.

Read the status line as well: it reports completed and unfinished segments, skipped missing events, and the round-trip cost. If an exact planned entry or exit candle is unavailable, the affected event or segment is skipped rather than filled at a later price.

## 5. Read the original-bias fixed-holding statistics

![Full-history original-bias statistics with 5 bps per side](images/04-bias-backtest.png)

Choose “原 Bias · 固定持有统计” and click “运行回测”. At each 2H candle's opening, bias above +0.1 selects long and bias below −0.1 selects short; values between those thresholds, including the boundaries, are neutral. Entry uses that candle's close. Exit uses the close 2, 6, 12, 24, 72, or 168 hours later.

Each “持有时长” (holding period) has “合计” (combined), “多” (long), and “空” (short) rows. “样本数” is the sample count. “扣成本胜率” is the win rate after costs. “平均毛收益” is the mean before costs; “扣成本平均” and “扣成本中位数” are the mean and median after costs. An em dash indicates that no sample is available for that statistic.

Only samples with entry and exit closes inside the selected period are counted. Holding windows containing missing candles are skipped; their count appears in the status line. Treat each holding period separately. Samples can overlap, so adding or compounding them would not produce a realizable account return, equity curve, or annualized return. Do not combine them with the midpoint results.

Both methods use simple price returns relative to the entry price. A short segment can show a loss below −100%; this does not simulate an account that could hold the position without additional margin. The data contain closing prices only, so intraperiod maximum adverse excursion (MAE) is not calculated. Means, medians, and win rates are research statistics, not proof of future profitability.

## 6. Check the five-year direction calendar

![Five-year direction timeline and its effective-date table](images/05-calendar.png)

Open “五年日历” (five-year calendar). The table covers **2026-09-15 to 2031-09-15**, including the start and excluding the end. “生效时间（含）” is the inclusive effective time; “结束时间（不含）” is the exclusive end time; “日历方向” is the phase direction; and “色带时间中点” is the underlying band midpoint.

At an exact switch time, the new phase becomes effective. The first row continues a phase that began before the displayed window, so its clipped start is not a new switch. The table cutoff also does not create a switch. Calendar red high-band midpoints map to short-only and green deep-band midpoints to long-only, always permitting a flat position.

Future calendar dates are calculated from a fixed time formula. They contain no future market prices and do not establish whether prices will rise or fall. The original formula is retained, including its 23:00 day boundary and unreachable `j = 10` branch; it has not been calibrated to an authoritative solar-term calendar.

## 7. Use it on a phone or tablet

![Phone-sized layout](images/06-phone.png)

Open the same official website in your phone or tablet browser. Scroll vertically to reach each section, and swipe sideways **inside a table** to see columns beyond the screen. For dense chart labels, rotate the device to landscape or select a shorter chart range.

Bookmark the page, or use “Add to Home Screen” if your browser offers it. This creates a shortcut; it is not a native app installer and does not guarantee offline availability. Use the computer ZIP below when you need the provided offline edition.

## 8. Offline on a computer

1. Open the official [Releases page](https://github.com/biaogebaofu/iching-cycle-backtest/releases) and download the official offline ZIP containing `index.html`.
2. **Extract the entire ZIP first.** Do not open the page inside the archive or extract only `index.html`.
3. Double-click `index.html` in the extracted folder. If prompted, choose a browser such as Edge, Chrome, Firefox, or Safari.
4. Keep the resource files in their extracted folder structure. Next time, open `index.html` again.

Windows and macOS are supported. Python, Node.js, and Git are unnecessary.

![Structure diagram based on the official offline package's actual file list](images/07-offline-files.svg)

This is a folder-structure diagram based on the actual package contents, rather than a screenshot of a file manager. **`index.html` is the entry point.** Keep `assets` beside it, including the bundled chart library, historical snapshot, and application scripts. Keep the other supplied files and copyright notices too. You do not need to open the scripts or run commands. The current-phase calendar still uses your computer's clock; the bundled historical prices remain the same static snapshot.

## Common situations

| Situation | What to do |
| --- | --- |
| Charts are blank offline | Check that the whole ZIP was extracted and its resources remain in place; reopen `index.html` in a browser. |
| Phone charts look crowded | Use landscape orientation or select a shorter date range. |
| Changing a chart range does not change the backtest | Set the dates under “回测研究” and click “运行回测”; chart ranges only change the display. |
| Today's prices are absent | This is a static historical snapshot without automatic updates. |
| Red and green seem inconsistent | The original bias chart uses red for long bias and green for short bias. The direction calendar uses a different band-midpoint mapping. Read each area's explanation separately. |
| You want to share the project | Share the official website or repository link. Redistribution of source or offline packages is subject to the [copyright notice](../LICENSE). |

The model's validity has not been established. This project retains all rights in its original code and documentation; public source is available for viewing, without an open-source license. You may use the official website and unmodified official offline packages for personal, noncommercial research under the [copyright notice](../LICENSE).

Remove accounts, keys, private positions, and personal information from any issue report or screenshot.

# Quick start: no programming required

[Project overview](../README.en.md) · [中文](QUICKSTART.zh-CN.md)

## Recommended: open the website

Open [I Ching Cycle Calendar & Backtest](https://biaogebaofu.github.io/iching-cycle-backtest/).

Open it in a browser on a computer, phone, or tablet. Registration, a trading account, and programming tools are unnecessary. Your phone browser may offer Add to Home Screen as a shortcut; network access is still required when the page needs it.

## Offline on a computer

1. Open the official [Releases page](https://github.com/biaogebaofu/iching-cycle-backtest/releases) and download the official offline ZIP containing `index.html`.
2. **Extract the entire ZIP first.** Do not open the page inside the archive or extract only `index.html`.
3. Double-click `index.html` in the extracted folder. If prompted, choose a browser such as Edge, Chrome, Firefox, or Safari.
4. Keep the resource files in their extracted folder structure. Next time, open `index.html` again.

Windows and macOS are supported. Python, Node.js, and Git are unnecessary.

## Your first look

1. Read the direction calendar's current phase, start and end times, and next phase. Long-only / short-only is a rule output, not an instruction to place an order.
2. Select a historical date range in the chart. Actual prices stop at 2026-09-15; later sections have no actual price data.
3. “回测口径” (analysis method) defaults to “方向日历 · 中点切换基准” (direction-calendar midpoint baseline), starting on 2019-12-25 and covering the full history. Examine “原 Bias · 固定持有统计” (original bias with fixed holding periods) separately; its thresholds are ±0.1. Do not combine the methods.
4. Set “单边成本（bps）” (per-side cost), then click “运行回测” (run backtest). For example, 5 bps means 0.05% per side and 0.10% per completed round trip. An unfinished midpoint position deducts only its incurred entry cost. The default of zero reproduces gross-return statistics. Funding and leverage are excluded.
5. Check sample counts, completed trades, unfinished segments, and samples skipped for data gaps. Fixed-holding-period samples may overlap and are not realizable account returns.

Historical results are for research. Future calendar entries extend a time formula; they do not predict future prices. The model's validity has not been established.

The backtest does not carry in positions from before your selected start date. The current data contain closing prices only, so intraperiod maximum adverse excursion (MAE) is not calculated.

## Common situations

| Situation | What to do |
| --- | --- |
| Charts are blank offline | Check that the whole ZIP was extracted and its resources remain in place; reopen `index.html` in a browser. |
| Phone charts look crowded | Use landscape orientation or select a shorter date range. |
| Today's prices are absent | This is a static historical snapshot without automatic updates. |
| Red and green seem inconsistent | The original bias chart uses red for long bias and green for short bias. The direction calendar uses a different band-midpoint mapping. Read each area's explanation separately. |
| You want to share the project | Share the official website or repository link. Redistribution of source or offline packages is subject to the [copyright notice](../LICENSE). |

Remove accounts, keys, private positions, and personal information from any issue report or screenshot.

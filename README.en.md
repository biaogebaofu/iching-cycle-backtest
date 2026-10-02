# I Ching Cycle Calendar & Backtest · 易经周期日历与回测

[中文](README.md) · [Quick start](docs/QUICKSTART.en.md) · [Data](docs/DATA.md) · [Privacy](PRIVACY.md) · [Use boundaries](docs/RISK_NOTICE.md)

**v0.2.0: for entertainment and model research only. Do not use it for investment decisions. Free of charge, without referral commissions.**

This public source-viewing project experiments with time rules. It targets eligible users outside mainland China. Data access is unavailable to users in mainland China or other restricted locations. The region declaration is self-reported, not IP blocking or a legal eligibility certification.

[Website](https://biaogebaofu.github.io/iching-cycle-backtest/) · [Repository](https://github.com/biaogebaofu/iching-cycle-backtest) · [Versions and downloads](https://github.com/biaogebaofu/iching-cycle-backtest/releases)

## Connect before anything is displayed

![Default page: purpose notice and a user-initiated connection, without market data or directions](docs/images/01-start.png)

The new edition **bundles no real historical market data**. Opening it makes no default OKX request and does not automatically display prices, backtests, current directions, or the calendar. Eligible users read the notices, make their own declarations, and press “连接并读取公开行情” (connect and read public prices). Successful loading reveals charts and the model calendar. Backtest results additionally require pressing “运行回测” (run backtest); they are not calculated automatically.

“Unauthenticated” describes the endpoint's technical authentication requirement. It does not establish permission for unrestricted data use. The connection does not log in to an account, read positions, or place orders.

## Connection and session data

- Your browser sends read-only GET requests directly to an official OKX domain. The project provides no forwarding proxy or account-credential collection.
- Prices and current calculations remain in page memory. Refreshing or clearing discards them; they are not supplied in the repository or ZIP.
- Loading is user-initiated, without continuous automatic refresh. Read the actual returned range, count, and cutoff displayed for the current session.
- Requested history can be 90 days, 1 year, or 3 years; the default is 1 year. This is a request target, not guaranteed coverage. Select your applicable official service region, without switching regions to bypass restrictions.
- Network failures, regional restrictions, CORS, or other connection errors stop loading. No proxy or circumvention method is provided.
- The extracted package opens locally for its interface and documentation. Acquiring real prices still requires a network connection; it is no longer a bundled-data offline research edition.

![No data connection without a region declaration or when a restricted region is declared](docs/images/02-restricted.png)

Free access and an entertainment label do not waive applicable rules. Check your eligibility and the [use boundaries](docs/RISK_NOTICE.md) before connecting. This project does not claim OKX data-redistribution permission.

## What becomes available after connection

| Feature | Meaning |
| --- | --- |
| Original signals and price charts | Time-formula signals over the current session's prices. Future signals contain no future market prices. |
| Direction-calendar midpoint baseline | Red high-band midpoints select hypothetical inverse (original short) and green deep-band midpoints hypothetical positive (original long). Entry and exit use closes of the aligned 2H candles. |
| Original bias with fixed holding periods | Bias above +0.1 selects hypothetical long and below −0.1 hypothetical short; compare later closes at fixed horizons. |
| Direction calendar | Original time-rule phases, displayed only after successful connection. Direction labels are entertainment-research outputs, not investment instructions. |

The original time algorithm is retained, including its 23:00 day boundary and unreachable j = 10 branch. Its validity has not been established. The two backtests remain separate. Neither simulates actual execution, funding, leverage, margin, or liquidation. Closing prices alone cannot establish intraperiod maximum adverse excursion (MAE).

Cost settings affect hypothetical statistics and do not charge you: 5 bps is 0.05% per side and 0.10% for a completed round trip. An unfinished midpoint segment deducts only its hypothetical entry cost. Win rates, means, and medians are not account returns or future-profit guarantees. Fixed-holding samples can overlap and cannot be compounded into an equity curve.

### Synthetic illustration in the documentation

![Explicitly synthetic data for documentation, not real OKX prices or actual returns](docs/images/03-entertainment-demo.png)

**This result image uses clearly labelled synthetic data solely to explain the interface and hypothetical statistics.** It does not represent real markets, bundled prices, or predictive ability. The public application does not automatically load this synthetic demonstration. Users must still establish their own eligibility and actively connect.

## Everyday use

1. Open the page and read the purpose, region, and data notices.
2. Only if eligible, select “使用地区” (use location), “适用的 OKX 官方服务区域” (applicable official service region), and “请求历史范围” (requested history). Personally confirm the notice, then press “连接并读取公开行情”. Enter no passwords, accounts, or keys.
3. After success, check coverage, set chart ranges, dates, and hypothetical costs, then press “运行回测”.
4. Press “取消 / 清除本次数据” (cancel / clear this session) or refresh when finished.

Computers, phones, and tablets use the browser. Python, Node.js, and Git are unnecessary. Extract the whole ZIP before opening index.html. The interface and documentation can be read locally; real data require online access. Add to Home Screen is a shortcut, without guaranteed offline availability. See the [English guide](docs/QUICKSTART.en.md) and [Chinese guide](docs/QUICKSTART.zh-CN.md). The interface is mainly Chinese.

## Copyright and version scope

Copyright © 2026 biaogebaofu. **All rights reserved. Public source is available for viewing, without an open-source license.**

The [LICENSE](LICENSE) permits personal, noncommercial use of the official website and unmodified official packages. It does not replace OKX's data conditions. Adapting, redistributing, or commercially using the project's original source requires separate written permission. GitHub's platform viewing and forking rights remain applicable. [Third-party components](THIRD_PARTY_NOTICES.md) retain their own licenses.

These statements describe the current v0.2.0 application and package. They do not establish that older commits, screenshots, or releases have been removed from GitHub history; those require a separate audit and action.

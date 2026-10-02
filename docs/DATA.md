# 数据说明 · Data · v0.2.0

**纯属娱乐与模型研究，不用于投资决策。**

## 中文

### 当前版本的数据路径

当前源码与发布包不捆绑真实历史行情。默认页面不请求 OKX，也不显示行情、回测或日历方向。用户符合使用条件并主动连接后，浏览器直接向 OKX 官方域名请求免密公开行情，只使用只读 GET，不登录交易账户、不提供密钥、不下单。

“适用的 OKX 官方服务区域”提供全球服务 openapi.okx.com、美国 / 澳大利亚 us.okx.com、欧洲经济区 eea.okx.com；只能选择本人适用的服务，不得为绕过限制换区域。不同服务未必提供 ETH-USDT-SWAP。“请求历史范围”为最近 90 天、1 年或 3 年，默认 1 年，实际覆盖以返回结果为准。加载完成只展示图表与模型日历，回测需另点“运行回测”。

实际取得的时间范围、K 线数量和截止时间以当前会话页面显示为准。它们取决于接口返回、可用范围、网络和加载是否完成，不沿用旧版固定快照或固定截止日期。请求失败时不使用旧快照或文档合成数据替代。刷新或清空后的新会话不会继承本次行情。

行情保存在内存中，不随版本分发；没有持续自动刷新。解压包可本地打开界面与文档，但真实行情仍需主动联网取得。网络、地区、CORS 等阻止访问时停止，不提供代理转发或规避流程。

### 研究口径

算法保留原时间公式，两种回测分别计算。图中 2H 是 2 小时 K 线，价格使用收盘值；横轴按 K 线开始时间标注。日期使用北京时间 UTC+08:00，当前时刻依赖设备时钟。

回测只使用可验证的已完成价格窗口；缺失的入场/退出事件或含缺口的固定持有窗口跳过。中点未完成段按截止范围内最后可用收盘价进行假设估值，不进入完成样本统计。仅有收盘价时不计算盘中 MAE。它们是模型假设统计，不是真实成交记录、实时行情服务或投资依据。

### 文档图与权限

文档中的结果图片仅使用明确标注的合成数据。该演示不是 OKX 行情，不与真实日期市场表现对应；公开应用不自动加载这份演示数据。默认页和地区限制图片展示空状态。

本项目不宣称获得 OKX 行情再分发权。公开免密不等于可再分发，具体条件见[使用边界](RISK_NOTICE.md)。本说明只覆盖当前包，不证明旧提交、图片和发布包已被移除。

## English

**For entertainment and model research only. Do not use it for investment decisions.**

### Current data flow

The current source and package bundle no real historical prices. The default page makes no OKX request and displays no prices, backtests, or direction calendar. Only after an eligible user actively connects does the browser make read-only GET requests directly to an official OKX public market-data endpoint. No trading login, credentials, or orders are involved.

The official service-region options are global (openapi.okx.com), US / Australia (us.okx.com), and EEA (eea.okx.com). Select only the service applicable to you, without bypassing restrictions. ETH-USDT-SWAP may be unavailable in a service. Requested history is 90 days, 1 year, or 3 years, defaulting to 1 year; actual coverage depends on returned prices. Successful loading displays charts and the model calendar. Statistics require a separate “运行回测” action.

Read the fetched range, candle count, and cutoff shown for the current session. They depend on the response, available history, network, and completion. The old fixed snapshot and cutoff do not define this version's coverage. Failure does not trigger a fallback to old prices or documentation's synthetic data. A refreshed or cleared session does not inherit the previous prices.

Data remain in memory, without bundled redistribution or continuous refresh. The extracted interface and documents open locally, but acquiring real prices still requires an active online connection. Network, regional, or CORS failures stop loading, without a forwarding proxy or circumvention flow.

### Research conventions

The original time formula is retained. The two backtests are calculated separately. 2H means a two-hour candle: charts use closing prices at a candle-opening horizontal timestamp. Dates use Beijing time, UTC+08:00, and the device supplies the current clock.

Only verifiable completed price windows are used. Missing entry or exit events and gapped fixed-holding windows are skipped. An unfinished midpoint segment is hypothetically marked at the last available close within the cutoff and excluded from completed-sample statistics. Closing prices alone cannot provide intraperiod MAE. Outputs are hypothetical model statistics, not executions, a continuous live feed, or an investment basis.

### Illustrations and permissions

Result images in the documentation use clearly labelled synthetic data, not OKX prices or real market performance. The public application does not automatically load that demonstration. Startup and restriction images show empty states.

The project claims no OKX data-redistribution permission. See [use boundaries](RISK_NOTICE.md). This notice covers the current package and does not establish removal of older commits, images, or releases.

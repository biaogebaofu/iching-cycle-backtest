# 隐私说明 · Privacy · v0.2.0

**纯属娱乐与模型研究，不用于投资决策。**

## 中文

### 默认页面

打开应用只显示用途说明与连接入口，不默认请求 OKX，不自动显示行情、回测结果或方向日历。当前版本不捆绑真实历史行情，不要求登录本项目或在页面输入 OKX 账户、密码、API 密钥或其他凭据。

### 用户主动连接后

符合使用条件的用户点“连接并读取公开行情”后，浏览器直接向所选 OKX 官方域名发送只读 GET 请求。项目不代理请求、不接收账户凭据、不读取私人仓位、不下单，不提供持续自动刷新。图表与日历在连接成功后显示，回测须另点“运行回测”。OKX 作为请求接收方可能获得 IP、浏览器请求头等网络信息；项目托管服务也可能按其政策处理网页访问日志。

行情与计算结果只在当前页面内存中使用。刷新或点“取消 / 清除本次数据”后，应用丢弃当前会话数据；不会把它们写回公开仓库或提供随包行情快照。地区与用途声明是用户自声明，不是 IP 定位或法律资格认证。中国大陆及其他受限地区不能使用连接功能。

### 边界

网络、地区或 CORS 限制导致无法连接时停止，不使用代理规避。免密访问仍有使用条件，见[使用边界](docs/RISK_NOTICE.md)。免费不代表获得第三方数据授权。

本说明针对当前应用与包，不宣称旧 Git 提交、旧真实数据图片或历史发布包已经清除。报告问题时请勿附带账户、密钥、私人仓位、完整行情数据或其他私人信息；文档结果图使用明确标注的合成演示数据。

## English

**For entertainment and model research only. Do not use it for investment decisions.**

### Default page

Opening the app displays purpose notices and the connection entry only. It makes no default OKX request and automatically displays no prices, backtests, or direction calendar. The current edition bundles no real historical prices and asks for no project login, OKX account, password, API key, or other credential.

### After an active connection

An eligible user presses “连接并读取公开行情” to initiate read-only GET requests directly from the browser to the selected official OKX domain. The project neither proxies requests nor collects credentials, reads private positions, places orders, or continuously refreshes data. Charts and the calendar appear after success; statistics additionally require pressing “运行回测”. OKX may receive your IP and browser request headers. The site host may also process page-access logs under its own policies.

Prices and calculations are used only in current page memory. Refreshing or pressing “取消 / 清除本次数据” discards them. They are not written back to the repository or supplied as a bundled snapshot. Region and purpose declarations are self-reported, not IP geolocation or legal eligibility certification. Mainland China and other restricted locations cannot use the connection.

### Boundaries

Network, region, or CORS failures stop loading, without a circumvention proxy. Read the [use boundaries](docs/RISK_NOTICE.md); free access does not establish third-party data permission.

This notice describes the current application and package, not confirmed removal of old Git commits, real-data images, or historical releases. Reports must exclude accounts, keys, private positions, complete market-data dumps, and personal information. Documentation results use explicitly labelled synthetic demonstration data.

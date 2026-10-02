# Changelog / 更新记录

## v0.2.0 · 2026-10-02

- Reframed the project as free entertainment and model research, with no referral commissions or investment-decision purpose.
- Changed startup to a purpose/region notice and user-initiated connection. Prices and the model calendar appear only after success; statistics require a separate run-backtest action.
- Added applicable official service-region selection and requested history of 90 days, 1 year or 3 years, without a guarantee of complete coverage.
- Removed bundled real market prices from the current application/package design. Session coverage now depends on the prices the user actively requests.
- Added a direct browser-to-OKX read-only GET data flow, without credentials, account access, orders, a forwarding proxy, or continuous automatic refresh.
- Limited session prices and calculations to page memory, discarded on refresh or clearing.
- Added self-declared eligibility for use outside mainland China and other restricted locations. This is not IP blocking or legal certification.
- Updated data, privacy and use-boundary notices, with links to official OKX terms.
- Replaced current documentation's real-price illustrations with startup/restriction views and a clearly labelled synthetic result example.
- Retained the original formula and separate hypothetical statistical methods.

纯属娱乐与模型研究，不用于投资决策。免费、无返佣。默认不请求 OKX、不自动展示方向；由符合条件的用户主动连接后才显示。当前版本不捆绑真实历史行情，文档结果图只使用明确标注的合成数据。

以上记录描述当前版本的变更，不表示旧 Git 提交、旧真实数据截图或历史发布包已经清除；历史内容需另行核查处理。免密、免费及娱乐定位不替代适用规则或 OKX 数据使用条件。

## 历史版本 / Earlier editions

以下是旧版记录，不代表 v0.2.0 当前数据能力或授权状态。

### v0.1.1 · 2026-10-02

- Added six screenshots and a package-structure diagram for the earlier bundled-snapshot edition.
- Expanded Chinese and English descriptions of charts, statistical methods, costs, calendars and local use.
- Added browser-readable illustrated guides.

旧版图文说明面向当时的捆绑行情展示方式，不适用于 v0.2.0 的主动连接与空状态流程。

### v0.1.0 · 2026-10-02

- Created a standalone formula calendar, price/signal charts and two research-statistics methods.
- Added responsive layouts and a local browser package.
- Preserved the original formula and checked calendar boundaries against the original Python implementation.
- Added cost assumptions, incomplete-segment labels and gap handling.
- Excluded account controls, credentials, private trade records and server configuration from public-export files.
- Added bilingual documentation and an all-rights-reserved notice.

旧版包含静态行情快照。当前新版不依靠该快照；这些历史说明不构成对旧仓库内容或旧下载包清理完成的声明。

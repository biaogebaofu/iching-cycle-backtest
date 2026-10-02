# Validation / 验证 · v0.2.0

This release was checked locally before publication:

- 11 core tests: exact Bias parity at every 2H point from 2019 through 2033; calendar parity at all phase boundaries and leap days; data validation; holding-window, cost, incomplete-period and missing-candle cases.
- 13 mocked public-data checks: official-domain allowlist, fixed credential-free GET, confirmed candles, sorting and conflicts, complete Beijing days, sequential pagination, cancellation, timeout, error handling and bounded requests.
- 7 application-state checks execute the actual app event handlers: startup, eligibility, cancellation, withdrawal, stale completion/finalization, data clearing and the midnight end-date regression. Total: 31 automated checks.
- Browser checks covered default hidden outputs, disabled connection, mainland/restricted options, withdrawal, cancellation, manual execution and clearing. A private, prominently labelled synthetic fixture exercised both backtests. Its generator is not distributed with the application.
- End-date limits use the last available close time, including a candle closing at midnight on the next day, so the last close is not lost due to its opening date.
- Desktop, 390 × 844 phone and 768 × 1024 tablet layouts were checked. No page-level horizontal overflow or JavaScript errors were observed; result tables scroll within their own containers.
- Three documentation images show the empty/restricted interface and a labelled synthetic result. The v0.2.0 package includes no real OKX-price screenshot or historical-price snapshot.

## External access limitation / 外部连接限制

A public GET to the official global history-candles endpoint returned HTTP 403 from the verification environment. This run therefore does not establish successful live OKX access or browser CORS compatibility for the hosted site, local files, any region, or every device. No alternate region or proxy was used to bypass the response. Availability, product eligibility and browser policies remain external constraints; the application stops and reports failures.

当前验证环境访问官方接口返回 403。算法、模拟请求及页面流程通过，不代表真实行情连接已在此环境成功。当地与平台不允许、接口拒绝或浏览器阻止时，应停止使用。

These checks verify implementation consistency, not predictive validity. They do not establish scientific support for I Ching market prediction, future profitability, or compatibility with every browser/device.

## Reproduce the core checks

For readers inspecting this release, the included tests can be run with Node.js and Python 3 installed:

```sh
node --test tests/core.test.cjs tests/market-data.test.cjs tests/app-state.test.cjs
```

Ordinary use needs a browser, not these developer tools. The local package contains the interface and documentation; actual data requires an eligible, explicit network connection. The Python reference contains no deployment or account code.

These checks are not a legal exemption or data-provider authorization. Older Git commits and releases are separate from this package and are not claimed to have been erased.

# Validation / 验证

This release was checked locally before publication:

- 11 core tests: exact Bias parity at every 2H point from 2019 through 2033; calendar parity at all phase boundaries and leap days; data validation; holding-window, cost, incomplete-period and missing-candle cases.
- The original 29,473-candle snapshot produced the same 17 midpoint legs as the previous implementation: 16 completed and 1 open at the snapshot cutoff, with identical dates, directions, prices and gross returns.
- Browser layout checked at 360 × 800, 768 × 1024 and 1440 × 1000. No page-level horizontal overflow or JavaScript errors; tables scroll within their own containers.
- Offline `file://` entry checked with all scripts loaded locally and no HTTP requests. Calendar, charts, both backtests, cost entry and invalid-date handling worked.

These checks verify implementation consistency, not predictive validity. They do not establish scientific support for I Ching market prediction, future profitability, or compatibility with every browser/device.

## Reproduce the core checks

For readers inspecting this release, the included tests can be run with Node.js and Python 3 installed:

```sh
node --test tests/core.test.cjs
```

Ordinary use requires only a browser; Node.js and Python are not needed to view the calendar or run the page's backtests. The Python test reference is the isolated original direction-calendar code, without deployment or account code.

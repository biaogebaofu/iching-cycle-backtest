# Historical data / 历史数据

The bundled `assets/history.js` contains only public-market timestamp/closing-price pairs extracted from the original project's OKX-labelled ETH-USDT-SWAP 2-hour snapshot. No account balances, positions, order IDs or personal trades are included.

- 29,473 consecutive 2-hour candles.
- First candle opens 2019-12-25 00:00 UTC (08:00 Beijing).
- Last candle closes 2026-09-15 02:00 UTC (10:00 Beijing).
- Daily prices use the final close of a complete Beijing calendar day with exactly 12 consecutive candles. Partial days are excluded.
- The original snapshot was not downloaded again or independently verified candle by candle for this publication. It is an archival research input, not a live feed or a verified official exchange dataset.
- No automatic data refresh, exchange API request, or future market prices are supplied.

行情为原项目历史快照，仅抽取时间与收盘价。已检查排序、重复、连续2小时间隔及原始OHLC基本范围，但没有逐根向交易所重新核验。数据不含个人账户内容；作者不主张对第三方市场数据拥有独占权，也不额外授予上游未授予的数据再分发权。

Source reference / 来源参考: [OKX market data documentation](https://www.okx.com/docs-v5/en/#rest-api-market-data-get-candlesticks-history).

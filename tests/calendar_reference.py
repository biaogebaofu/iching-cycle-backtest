"""Original direction-calendar rules, retained as an independent regression reference.

Copyright (c) 2026 biaogebaofu. All rights reserved. See LICENSE.
The test reference uses only the Python standard library and no private data.
"""
import json
import sys
from datetime import datetime, timedelta, timezone
from functools import lru_cache

BEIJING = timezone(timedelta(hours=8))
DAY = timedelta(days=1)
TWO_HOURS = timedelta(hours=2)
EPOCH = datetime(1970, 1, 1, tzinfo=timezone.utc)
BOUNDARIES = ((2, 4), (3, 6), (4, 5), (5, 6), (6, 6), (7, 7),
              (8, 7), (9, 8), (10, 8), (11, 7), (12, 7), (1, 6))
TABLE_START = datetime(2026, 9, 15, tzinfo=BEIJING)
TABLE_END = datetime(2031, 9, 15, tzinfo=BEIJING)
CHART_START = datetime(2019, 1, 1, tzinfo=BEIJING)
CHART_END = datetime(2033, 1, 1, tzinfo=BEIJING)


def month_index(t):
    t = t.astimezone(BEIJING)
    index = 11
    for i, boundary in enumerate(BOUNDARIES):
        if (t.month, t.day) < boundary:
            index = i - 1 if i else 11
            break
    return index


def band_color(t):
    t = t.astimezone(BEIJING)
    stem = (2 * ((t.year - 4) % 5) + 2 + month_index(t)) % 10
    return 'red' if stem <= 5 else 'green' if stem >= 8 else 'neutral'


@lru_cache(maxsize=None)
def switch_events(year):
    day = datetime(year - 2, 1, 1, tzinfo=BEIJING)
    stop = datetime(year + 3, 1, 1, tzinfo=BEIJING)
    bands = []
    while day < stop:
        color = band_color(day)
        if not bands or color != bands[-1][2]:
            bands.append([day, day + DAY, color])
        else:
            bands[-1][1] = day + DAY
        day += DAY
    events = []
    for start, end, color in bands[1:-1]:
        if color == 'neutral':
            continue
        center = start + (end - start) / 2
        steps, remainder = divmod(center - EPOCH, TWO_HOURS)
        switch = EPOCH + (steps + bool(remainder) + 1) * TWO_HOURS
        events.append((switch.astimezone(BEIJING), 1 if color == 'green' else -1,
                       center, start, end))
    return tuple(events)


def phase(event, following):
    start, side, center, band_start, band_end = event
    end = following[0]
    return {
        'start': start.isoformat(), 'end_exclusive': end.isoformat(),
        'start_epoch': start.timestamp(), 'end_epoch': end.timestamp(),
        'direction': side, 'label': '只多／可空仓' if side == 1 else '只空／可空仓',
        'allowed_position': 'long_or_flat' if side == 1 else 'short_or_flat',
        'origin_switch': start.isoformat(), 'band_center': center.isoformat(),
        'band_start': band_start.isoformat(), 'band_end_exclusive': band_end.isoformat(),
        'next_switch': end.isoformat(),
    }


def events_for(start, end):
    return sorted({event for year in range(start.year, end.year + 1)
                   for event in switch_events(year)})


def five_year_table():
    events = events_for(TABLE_START, TABLE_END)
    intervals = []
    for event, following in zip(events, events[1:]):
        if following[0] <= TABLE_START or event[0] >= TABLE_END:
            continue
        row = phase(event, following)
        start, end = max(event[0], TABLE_START), min(following[0], TABLE_END)
        row.update(start=start.isoformat(), end_exclusive=end.isoformat(),
                   start_epoch=start.timestamp(), end_epoch=end.timestamp())
        intervals.append(row)
    return {'status': 'FORMULA_ONLY_NOT_CONNECTED_TO_TRADING', 'timezone': 'UTC+08:00',
            'start': TABLE_START.isoformat(), 'end_exclusive': TABLE_END.isoformat(),
            'rule': 'red-band midpoint -> short only; green-band midpoint -> long only; effective at 2H candle close',
            'intervals': intervals, 'next_switch_after_window': intervals[-1]['next_switch']}


def calendar_state(ms):
    now = datetime.fromtimestamp(ms / 1000, BEIJING)
    events = switch_events(now.year)
    index = max(i for i, event in enumerate(events) if event[0] <= now)
    chart_events = events_for(CHART_START, CHART_END)
    chart = [phase(event, following) for event, following in zip(chart_events, chart_events[1:])
             if following[0] > CHART_START and event[0] < CHART_END]
    return {'timezone': 'UTC+08:00', 'server_now': now.isoformat(),
            'server_now_epoch': now.timestamp(), 'current': phase(events[index], events[index + 1]),
            'next': phase(events[index + 1], events[index + 2]),
            'table': five_year_table(), 'chart_intervals': chart}


if __name__ == '__main__':
    json.dump([calendar_state(ms) for ms in json.load(sys.stdin)], sys.stdout, ensure_ascii=True)

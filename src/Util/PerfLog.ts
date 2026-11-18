import { Threads } from "@amodx/threads";

type TimerStat = { total: number; count: number; max: number };

export class PerfLog {
  static enabled = false;
  static intervalMs = 1000;

  private static _timers = new Map<string, TimerStat>();
  private static _counters = new Map<string, number>();
  private static _gauges = new Map<string, number>();
  private static _windowStart = 0;
  private static _interval: any = null;

  static now() {
    return performance.now();
  }

  static end(name: string, start: number) {
    if (!this.enabled) return 0;
    const elapsed = performance.now() - start;
    this.time(name, elapsed);
    return elapsed;
  }

  static time(name: string, ms: number) {
    if (!this.enabled) return;
    this._ensureRunning();
    let stat = this._timers.get(name);
    if (!stat) {
      stat = { total: 0, count: 0, max: 0 };
      this._timers.set(name, stat);
    }
    stat.total += ms;
    stat.count++;
    if (ms > stat.max) stat.max = ms;
  }

  static count(name: string, amount = 1) {
    if (!this.enabled) return;
    this._ensureRunning();
    this._counters.set(name, (this._counters.get(name) || 0) + amount);
  }

  static gauge(name: string, value: number) {
    if (!this.enabled) return;
    this._ensureRunning();
    this._gauges.set(name, value);
  }

  static log(message: string) {
    if (!this.enabled) return;
    console.log(`[DVE perf][${this._label()}] ${message}`);
  }

  private static _id = Math.random().toString(36).slice(2, 5);
  private static _label() {
    const name = Threads.threadName || "main";
    return `${name}#${this._id}`;
  }

  private static _ensureRunning() {
    if (this._interval !== null) return;
    this._windowStart = performance.now();
    this._interval = setInterval(() => this.flush(), this.intervalMs);
  }

  static flush() {
    const now = performance.now();
    const windowMs = now - this._windowStart;
    this._windowStart = now;
    if (!this._timers.size && !this._counters.size && !this._gauges.size)
      return;

    const parts: string[] = [];
    const timerNames = [...this._timers.keys()].sort();
    for (const name of timerNames) {
      const s = this._timers.get(name)!;
      parts.push(
        `${name}: n=${s.count} avg=${(s.total / s.count).toFixed(2)}ms max=${s.max.toFixed(1)}ms total=${s.total.toFixed(0)}ms (${((s.total / windowMs) * 100).toFixed(0)}%)`
      );
    }
    const counterNames = [...this._counters.keys()].sort();
    if (counterNames.length)
      parts.push(
        "counts: " +
          counterNames.map((n) => `${n}=${this._counters.get(n)}`).join(" ")
      );
    const gaugeNames = [...this._gauges.keys()].sort();
    if (gaugeNames.length)
      parts.push(
        "gauges: " +
          gaugeNames.map((n) => `${n}=${this._gauges.get(n)}`).join(" ")
      );

    console.log(
      `[DVE perf][${this._label()}] window=${windowMs.toFixed(0)}ms\n  ` +
        parts.join("\n  ")
    );

    this._timers.clear();
    this._counters.clear();
    this._gauges.clear();
  }
}

/** # Tick Interval
 * Creates a predictable tick interval.
 * Uses requestAnimationFrame when available, falling back to setTimeout.
 */
export class TickInterval {
  private _active = false;
  private interval = 1;
  private currentTimeout: number | undefined;
  private __timeoutFunc: () => void;

  private _useAnimationFrame: boolean;
  private _lastTick = 0;

  constructor(
    run?: () => void | Promise<void>,
    interval?: number,
    public stopOnError = true,
  ) {
    this._useAnimationFrame = typeof requestAnimationFrame !== "undefined";
    if (run) this.setOnRun(run);
    if (interval !== undefined) this.setInterval(interval);
  }

  setOnRun(run: () => void | Promise<void>) {
    this.__timeoutFunc = () => {
      if (!this._active) return;
      run();
      this.runInterval();
    };
    return this;
  }

  setInterval(interval: number) {
    this.interval = interval;
    return this;
  }

  private runInterval() {
    if (!this._active) return;

    if (this._useAnimationFrame) {
      this.currentTimeout = requestAnimationFrame((timestamp) => {
        if (!this._active) return;
        // Only fire once enough time has elapsed, matching the requested interval.
        if (timestamp - this._lastTick >= this.interval) {
          this._lastTick = timestamp;
          this.__timeoutFunc();
        } else {
          // Not time yet — re-queue without calling the callback.
          this.runInterval();
        }
      });
    } else {
      this.currentTimeout = <any>setTimeout(this.__timeoutFunc, this.interval);
    }
  }

  start() {
    if (!this._active) {
      this._active = true;
      this._lastTick = 0;
      this.runInterval();
    }
    return this;
  }

  stop() {
    this._active = false;
    if (this.currentTimeout !== undefined) {
      if (this._useAnimationFrame) {
        cancelAnimationFrame(this.currentTimeout);
      } else {
        clearTimeout(this.currentTimeout);
      }
    }
    this.currentTimeout = undefined;
    return this;
  }
}
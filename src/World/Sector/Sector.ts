import { Section, SectionData } from "../Section/Section.js";
import { Vec2Array, Vec3Array } from "@amodx/math";
import { WorldSpaces } from "../WorldSpaces";
import {
  getBitAtomicArrayIndex,
  setBitAtomicArrayIndex,
} from "../../Util/Binary/BinaryArrays.js";
import { SectorState, SectorStateDefaultBitFlags } from "./SectorState.js";
import { forceMultipleOf4 } from "../../Util/Binary/BinaryFunctions.js";
import { WorldRegister } from "../WorldRegister.js";
import { EngineSettings } from "../../Settings/EngineSettings.js";
import { PerfLog } from "../../Util/PerfLog.js";

export interface SectorData {
  buffer: ArrayBufferLike;
  /**Array of timestamps for the sector */
  timeStampArray: Uint32Array;
  /**Array of bit flags for the sector*/
  flagArray: Uint8Array;
  sections: SectionData[];
}
export interface Sector extends SectorData {}

const temp: Vec2Array = [0, 0];
/**Maps flag names used by older archives to their current names. */
const LegacyStoredFlagNames: Record<string, string> = {
  dve_is_world_progation_done: "dve_is_world_propagation_done",
};
export class Sector {
  static FlagIds = SectorState.Flags;
  static TimeStampIds = SectorState.TimeStamps;

  static GetHeaderSize() {
    return forceMultipleOf4(
      //12 bytes fot flags
      12 +
        //12 * 4 bytes for time stamps
        12 * 4
    );
  }

  static GetBufferSize() {
    const totalSections =
      WorldSpaces.sector.bounds.y / WorldSpaces.section.bounds.y;
    return this.GetHeaderSize() + Section.GetBufferSize() * totalSections;
  }

  static CreateNewBuffer() {
    return EngineSettings.settings.memoryAndCPU.useSharedMemory
      ? new SharedArrayBuffer(this.GetBufferSize())
      : new ArrayBuffer(this.GetBufferSize());
  }

  sections: Section[] = [];
  bufferView: Uint8Array;
  position: Vec3Array = [0, 0, 0];

  private _released = false;
  setReleased(released: boolean) {
    this._released = released;
  }
  isReleased() {
    return this._released;
  }

  private _checkedOut = false;
  private _checkedOutAt = 0;
  private _checkInWaiters: ((checkedIn: boolean) => void)[] = [];
  /**Set if the sector is checked out into another thread.  */
  setCheckedOut(checkedOut: boolean) {
    if (checkedOut && !this._checkedOut) {
      this._checkedOutAt = PerfLog.now();
      PerfLog.count("sector.checkOut");
    }
    if (!checkedOut && this._checkedOut && this._checkedOutAt) {
      PerfLog.end("sector.checkedOutFor", this._checkedOutAt);
      this._checkedOutAt = 0;
    }
    this._checkedOut = checkedOut;
    if (!checkedOut && this._checkInWaiters.length) {
      const waiters = this._checkInWaiters;
      this._checkInWaiters = [];
      for (let i = 0; i < waiters.length; i++) waiters[i](true);
    }
  }
  /**Will return true if the sector is checked out into another thread. */
  isCheckedOut() {
    return this._checkedOut || this.buffer.byteLength == 0;
  }
  /**Returns a promise that will resolve when the sector is no longer checked out. */
  waitTillCheckedIn() {
    if (!this._checkedOut) return true;
    const start = PerfLog.now();
    return new Promise<boolean>((resolve) => {
      this._checkInWaiters.push((checkedIn) => {
        PerfLog.end("sector.waitTillCheckedIn", start);
        resolve(checkedIn);
      });
    });
  }

  private _locked = false;
  /**Set if the sector is locked and can't be checked out.*/
  setLocked(locked: boolean) {
    this._locked = locked;
  }
  /**Will return true if the sector is locked out and can't be checked out. */
  isLocked() {
    return this._locked;
  }

  setBuffer(buffer: ArrayBufferLike) {
    this.buffer = buffer;
    this.flagArray = new Uint8Array(buffer, 0, 12);
    this.timeStampArray = new Uint32Array(buffer, 12, 12);
    this.bufferView = new Uint8Array(buffer);
    const totalSections = WorldSpaces.sector.sectionVolume;
    for (let i = 0; i < totalSections; i++) {
      if (!this.sections[i])
        this.sections[i] = WorldRegister._pools._sections.length
          ? WorldRegister._pools._sections.pop()!
          : new Section();

      this.sections[i].setBuffer(this, buffer, i);
    }
  }

  clear() {
    this.flagArray = null as any;
    this.timeStampArray = null as any;
    this.bufferView = null as any;
  }

  updateSectionDirectly(index: number, view: Uint8Array) {
    this.sections[index].view.set(view);
  }

  getSection(x: number, y: number, z: number) {
    return this.sections[WorldSpaces.section.getIndex(x, y, z)];
  }

  setBitFlag(index: number, value: boolean) {
    setBitAtomicArrayIndex(this.flagArray, index, value ? 1 : 0);
  }

  getBitFlag(index: number) {
    return getBitAtomicArrayIndex(this.flagArray, index) == 1;
  }

  isDisplayDirty() {
    return this.getBitFlag(SectorStateDefaultBitFlags.displayDirty);
  }

  setDisplayDirty(stored: boolean) {
    this.setBitFlag(SectorStateDefaultBitFlags.displayDirty, stored);
  }

  isLogicDirty() {
    return this.getBitFlag(SectorStateDefaultBitFlags.logicDirty);
  }

  setLogicDirty(stored: boolean) {
    this.setBitFlag(SectorStateDefaultBitFlags.logicDirty, stored);
  }

  setStored(stored: boolean) {
    this.setBitFlag(SectorStateDefaultBitFlags.stored, stored);
  }

  isStored() {
    return this.getBitFlag(SectorStateDefaultBitFlags.stored);
  }

  setTimeStamp(index: number, value: number) {
    this.timeStampArray[index] = value;
  }

  getTimeStamp(index: number) {
    return this.timeStampArray[index];
  }

  *getRenderableSections(): Generator<Section> {
    for (const section of this.sections) {
      const [min, max] = section.getMinMax();
      if (min == Infinity || max == -Infinity) continue;
      yield section;
    }
  }

  storeFlags() {
    const stored: Record<string, boolean> = {};
    for (const key in SectorState.StoredFlags) {
      stored[key] = this.getBitFlag(SectorState.StoredFlags[key]);
    }
    return stored;
  }

  loadFlags(flags: Record<string, boolean>) {
    for (const flag in flags) {
      const storedIndex =
        SectorState.StoredFlags[LegacyStoredFlagNames[flag] || flag];
      if (storedIndex === undefined) {
        console.warn(`${flag} does not exist on stored flags for sector`);
        continue;
      }
      this.setBitFlag(storedIndex, flags[flag]);
    }
  }

  storeTimestamps() {
    const stored: Record<string, number> = {};
    for (const key in SectorState.StoredTimeStamps) {
      stored[key] = this.getTimeStamp(SectorState.StoredTimeStamps[key]);
    }
    return stored;
  }

  loadTimestamps(stored: Record<string, number>) {
    for (const timeStamp in stored) {
      const storedIndex = SectorState.StoredTimeStamps[timeStamp];
      if (storedIndex === undefined) {
        console.warn(
          `${timeStamp} does not exist on stored timestamps for sector`
        );
        continue;
      }
      this.setTimeStamp(storedIndex, stored[timeStamp]);
    }
  }

  getMinMax() {
    temp[0] = Infinity;
    temp[1] = -Infinity;

    const [x, y, z] = this.position;

    for (let i = 0; i < this.sections.length; i++) {
      const [min, max] = this.sections[i].getMinMax();
      if (Math.abs(min) == Infinity || Math.abs(max) == Infinity) {
        continue;
      }
      if (min + y < temp[0]) {
        temp[0] = min + y;
      }
      if (max + y > temp[1]) {
        temp[1] = max + y;
      }
    }
    return temp;
  }
}

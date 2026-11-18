import { Vector3Like } from "@amodx/math";
import { SectorCursor } from "./SectorCursor";
import { WorldSpaces } from "../WorldSpaces";
import { DataCursorInterface } from "../../Voxels/Cursor/DataCursor.interface";
import { BoundingBox } from "@amodx/math/Geometry/Bounds/BoundingBox";

let cursorCache: SectorCursor[] = [];

const tempPosition = Vector3Like.Create();

export class WorldCursor implements DataCursorInterface {
  sectorCursors: Map<number, Map<number, SectorCursor>> = new Map();
  activeCursors: SectorCursor[] = [];

  origin = Vector3Like.Create();
  dimension = 0;

  _sectorPowerX = 0;
  _sectorPowerY = 0;
  _sectorPowerZ = 0;
  _minX = 0;
  _minY = 0;
  _minZ = 0;
  _maxX = 0;
  _maxY = 0;
  _maxZ = 0;

  volumeBounds = new BoundingBox();

  constructor() {
    this.updateBounds();
  }

  private updateBounds() {
    const world = WorldSpaces.world.bounds;
    this._minX = world.MinX;
    this._minY = world.MinY;
    this._minZ = world.MinZ;
    this._maxX = world.MaxX;
    this._maxY = world.MaxY;
    this._maxZ = world.MaxZ;
    this._sectorPowerX = WorldSpaces.sector.power2Axes.x;
    this._sectorPowerY = WorldSpaces.sector.power2Axes.y;
    this._sectorPowerZ = WorldSpaces.sector.power2Axes.z;
    this.volumeBounds.setMinMax(
      Vector3Like.Create(
        WorldSpaces.world.bounds.MinX,
        WorldSpaces.world.bounds.MinY,
        WorldSpaces.world.bounds.MinZ
      ),
      Vector3Like.Create(
        WorldSpaces.world.bounds.MaxX,
        WorldSpaces.world.bounds.MaxY,
        WorldSpaces.world.bounds.MaxZ
      )
    );
  }

  private _lastCursor: SectorCursor | null = null;
  private _lastSectorX = 0;
  private _lastSectorY = 0;
  private _lastSectorZ = 0;

  setFocalPoint(dimension: number, x: number, y: number, z: number) {
    this.sectorCursors.forEach((row) => {
      row.forEach((cursor) => {
        cursorCache.push(cursor);
      });
      row.clear();
    });
    this.sectorCursors.clear();
    this._lastCursor = null;
    if (
      this._sectorPowerX !== WorldSpaces.sector.power2Axes.x ||
      this._sectorPowerY !== WorldSpaces.sector.power2Axes.y ||
      this._sectorPowerZ !== WorldSpaces.sector.power2Axes.z ||
      this._minY !== WorldSpaces.world.bounds.MinY ||
      this._maxY !== WorldSpaces.world.bounds.MaxY
    )
      this.updateBounds();

    this.dimension = dimension;
    this.origin.x = x >> this._sectorPowerX;
    this.origin.y = y >> this._sectorPowerY;
    this.origin.z = z >> this._sectorPowerZ;

    this.getSector(x, y, z);
  }

  inBounds(x: number, y: number, z: number) {
    return (
      x >= this._minX &&
      x < this._maxX &&
      y >= this._minY &&
      y < this._maxY &&
      z >= this._minZ &&
      z < this._maxZ
    );
  }

  getSector(x: number, y: number, z: number) {
    if (!this.inBounds(x, y, z)) return null;

    const sectorX = x >> this._sectorPowerX;
    const sectorY = y >> this._sectorPowerY;
    const sectorZ = z >> this._sectorPowerZ;

    if (
      this._lastCursor !== null &&
      sectorX === this._lastSectorX &&
      sectorY === this._lastSectorY &&
      sectorZ === this._lastSectorZ
    )
      return this._lastCursor;

    const cx = sectorX - this.origin.x;
    const key = (sectorZ - this.origin.z) * 2048 + (sectorY - this.origin.y + 1024);

    let row = this.sectorCursors.get(cx);
    let cursor: SectorCursor | undefined;
    if (row) {
      cursor = row.get(key);
    } else {
      row = new Map();
      this.sectorCursors.set(cx, row);
    }

    if (!cursor) {
      cursor = cursorCache.length ? cursorCache.pop()! : new SectorCursor();
      if (
        !cursor.loadSector(
          this.dimension,
          sectorX << this._sectorPowerX,
          sectorY << this._sectorPowerY,
          sectorZ << this._sectorPowerZ
        )
      ) {
        cursorCache.push(cursor);
        return null;
      }
      row.set(key, cursor);
    }

    this._lastCursor = cursor;
    this._lastSectorX = sectorX;
    this._lastSectorY = sectorY;
    this._lastSectorZ = sectorZ;
    return cursor;
  }

  getVoxel(x: number, y: number, z: number) {
    const sector = this.getSector(x, y, z);
    if (!sector) return null;
    return sector.getVoxel(x, y, z);
  }

  clone() {
    return new WorldCursor();
  }
}

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

  setFocalPoint(dimension: number, x: number, y: number, z: number) {
    const sectorPosX = (x >> this._sectorPowerX) << this._sectorPowerX;
    const sectorPosY = (y >> this._sectorPowerY) << this._sectorPowerY;
    const sectorPosZ = (z >> this._sectorPowerZ) << this._sectorPowerZ;

    this.sectorCursors.forEach((row) => {
      row.forEach((cursor) => {
        cursorCache.push(cursor);
      });
      row.clear();
    });
    this.sectorCursors.clear();

    this.dimension = dimension;
    this.origin.x = sectorPosX >> this._sectorPowerX;
    this.origin.y = sectorPosY >> this._sectorPowerY;
    this.origin.z = sectorPosZ >> this._sectorPowerZ;

    this.getSector(x, y, z);
  }

  inBounds(x: number, y: number, z: number) {
    return (
      x >= this._minX &&
      x <= this._maxX &&
      y >= this._minY &&
      y <= this._maxY &&
      z >= this._minZ &&
      z <= this._maxZ
    );
  }

  getSector(x: number, y: number, z: number) {
    if (!this.inBounds(x, y, z)) return null;

    const sectorPosX = (x >> this._sectorPowerX) << this._sectorPowerX;
    const sectorPosY = (y >> this._sectorPowerY) << this._sectorPowerY;
    const sectorPosZ = (z >> this._sectorPowerZ) << this._sectorPowerZ;

    const cx = (sectorPosX >> this._sectorPowerX) - this.origin.x;
    const cz = (sectorPosZ >> this._sectorPowerZ) - this.origin.z;

    let row = this.sectorCursors.get(cx);
    if (row) {
      const cursor = row.get(cz);
      if (cursor) return cursor;
    } else {
      row = new Map();
      this.sectorCursors.set(cx, row);
    }

    const cursor = cursorCache.length ? cursorCache.pop()! : new SectorCursor();

    if (
      !cursor.loadSector(this.dimension, sectorPosX, sectorPosY, sectorPosZ)
    ) {
      cursorCache.push(cursor);
      return null;
    }

    row.set(cz, cursor);
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

import type { Section } from "../Section/index";
import { Sector } from "../Sector/index";

import { WorldRegister } from "../WorldRegister";
import { WorldVoxelCursor } from "./WorldVoxelCursor";
import { WorldSpaces } from "../WorldSpaces";

import { Vector3Like } from "@amodx/math";
import { DataCursorInterface } from "../../Voxels/Cursor/DataCursor.interface";
import { WorldSectionCursorInterface } from "./WorldSectionCursor.interface";
import { BoundingBox } from "@amodx/math/Geomtry/Bounds/BoundingBox";

const point = Vector3Like.Create();
export class SectorCursor
  implements DataCursorInterface, WorldSectionCursorInterface
{
  _current: Sector | null = null;
  _section: Section | null;
  private voxel = new WorldVoxelCursor(this);
  _voxelIndex = 0;
  _voxelPosition = Vector3Like.Create();
  _sectorPosition = Vector3Like.Create();
  volumeBounds = new BoundingBox();
  get volumePosition() {
    return this._sectorPosition;
  }
  constructor() {
    this.volumeBounds.setMinMax(
      Vector3Like.Create(0, 0, 0),
      Vector3Like.Create(
        WorldSpaces.sector.bounds.x,
        WorldSpaces.sector.bounds.y,
        WorldSpaces.sector.bounds.z
      )
    );
  }

  inBounds(x: number, y: number, z: number): boolean {
    point.x = x - this._sectorPosition.x + 0.5;
    point.y = y - this._sectorPosition.y + 0.5;
    point.z = z - this._sectorPosition.z + 0.5;
    return this.volumeBounds.intersectsPoint(point);
  }

  setSector(sector: Sector) {
    this._current = sector;
    this._sectorPosition.x = sector.position[0];
    this._sectorPosition.y = sector.position[1];
    this._sectorPosition.z = sector.position[2];
    return true;
  }

  loadSector(dimension: number, x: number, y: number, z: number) {
    const sector = WorldRegister.sectors.get(dimension, x, y, z);
    if (!sector) return false;
    this._current = sector;
    this._sectorPosition.x = sector.position[0];
    this._sectorPosition.y = sector.position[1];
    this._sectorPosition.z = sector.position[2];
    return true;
  }

  getSection(x: number, y: number, z: number) {
    if (!this._current) return null;
    const section =
      this._current.sections[WorldSpaces.section.getIndex(x, y, z)];
    if (!section) {
      if (!section)
        throw new Error(
          `Could not load section at ${x}-${y}-${z} | ${WorldSpaces.section.getIndex(
            x,
            y,
            z
          )}`
        );
      this._section = null;
      return null;
    }
    return section;
  }

  getVoxel(x: number, y: number, z: number) {
    if (!this._current) return null;
    const section = this.getSection(x, y, z);
    this._section = section;
    WorldSpaces.voxel.getPosition(x, y, z, this._voxelPosition);
    this._voxelIndex = WorldSpaces.voxel.getIndexFromPosition(
      this._voxelPosition.x,
      this._voxelPosition.y,
      this._voxelPosition.z
    );

    this.voxel.loadIn();
    return this.voxel;
  }

  getVoxelAtIndex(index: number) {
    this._voxelIndex = index;
  }

  clone() {
    return new SectorCursor();
  }
}

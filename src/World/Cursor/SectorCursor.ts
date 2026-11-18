import type { Section } from "../Section/index";
import { Sector } from "../Sector/index";

import { WorldRegister } from "../WorldRegister";
import { WorldVoxelCursor } from "./WorldVoxelCursor";
import { WorldSpaces } from "../WorldSpaces";

import { Vector3Like } from "@amodx/math";
import { DataCursorInterface } from "../../Voxels/Cursor/DataCursor.interface";
import { WorldSectionCursorInterface } from "./WorldSectionCursor.interface";
import { BoundingBox } from "@amodx/math/Geometry/Bounds/BoundingBox";

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
        WorldSpaces.sector.bounds.z,
      ),
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
      throw new Error(
        `Could not load section at ${x}-${y}-${z} | ${WorldSpaces.section.getIndex(
          x,
          y,
          z,
        )}`,
      );
    }
    return section;
  }

  getVoxel(x: number, y: number, z: number) {
    if (!this._current) return null;
    const sectionSpace = WorldSpaces.section;
    const sectorSpace = WorldSpaces.sector;
    const sectionPower = sectionSpace.power2Axes;
    const sectionIndex =
      ((z >> sectionPower.z) & sectorSpace.sectionZMask) |
      (((x >> sectionPower.x) & sectorSpace.sectionXMask) <<
        sectorSpace.sectionPower2Axes.z) |
      (((y >> sectionPower.y) & sectorSpace.sectionYMask) <<
        sectorSpace.sectionXZPower);
    const section = this._current.sections[sectionIndex];
    if (!section) {
      this.getSection(x, y, z);
      return null;
    }
    this._section = section;

    const lx = x & sectionSpace.xMask;
    const ly = y & sectionSpace.yMask;
    const lz = z & sectionSpace.zMask;
    const voxelPosition = this._voxelPosition;
    voxelPosition.x = lx;
    voxelPosition.y = ly;
    voxelPosition.z = lz;
    this._voxelIndex =
      lz | (lx << sectionPower.z) | (ly << sectionSpace.xzPower);

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

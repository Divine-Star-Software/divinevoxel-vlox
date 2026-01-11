import { WorldRegister } from "../WorldRegister";
import { WorldVoxelCursor } from "./WorldVoxelCursor";
import { WorldSpaces } from "../WorldSpaces";

import { Vector3Like } from "@amodx/math";
import { DataCursorInterface } from "../../Voxels/Cursor/DataCursor.interface";
import { WorldSectionCursorInterface } from "./WorldSectionCursor.interface";
import type { Section } from "../Section/index";
import { BoundingBox } from "@amodx/math/Geometry/Bounds/BoundingBox";

const point = Vector3Like.Create();
export class SectionCursor
  implements WorldSectionCursorInterface, DataCursorInterface
{
  _section: Section | null;
  private voxel = new WorldVoxelCursor(this);
  _voxelIndex = 0;
  _voxelPosition = Vector3Like.Create();
  _sectionPosition = Vector3Like.Create();
  volumeBounds = new BoundingBox();
  get volumePosition() {
    return this._sectionPosition;
  }
  constructor() {
    this.volumeBounds.setMinMax(
      Vector3Like.Create(0, 0, 0),
      Vector3Like.Create(
        WorldSpaces.section.bounds.x,
        WorldSpaces.section.bounds.y,
        WorldSpaces.section.bounds.z
      )
    );
  }

  inBounds(x: number, y: number, z: number): boolean {
    point.x = x - this._sectionPosition.x + 0.5;
    point.y = y - this._sectionPosition.y + 0.5;
    point.z = z - this._sectionPosition.z + 0.5;
    return this.volumeBounds.intersectsPoint(point);
  }

  setSection(section: Section) {
    this._section = section;
    const sectionPos = this._section.getPosition();
    this._sectionPosition.x = sectionPos[0];
    this._sectionPosition.y = sectionPos[1];
    this._sectionPosition.z = sectionPos[2];
  }

  loadSection(dimension: number, x: number, y: number, z: number) {
    const sector = WorldRegister.sectors.get(dimension, x, y, z);
    if (!sector) return false;
    this._section = sector.getSection(x, y, z);
    const sectionPos = this._section!.getPosition();
    this._sectionPosition.x = sectionPos[0];
    this._sectionPosition.y = sectionPos[1];
    this._sectionPosition.z = sectionPos[2];
    return true;
  }

  getVoxelAtIndex(index: number) {
    this._voxelIndex = index;
    WorldSpaces.voxel.getPositionFromIndex(index, this._voxelPosition);
    this.voxel.loadIn();
    return this.voxel;
  }

  getVoxel(x: number, y: number, z: number) {
    if (!this._section) return null;
    WorldSpaces.voxel.getPosition(x, y, z, this._voxelPosition);
    this._voxelIndex = WorldSpaces.voxel.getIndexFromPosition(
      this._voxelPosition.x,
      this._voxelPosition.y,
      this._voxelPosition.z
    );
    this.voxel.loadIn();
    return this.voxel;
  }

  clone() {
    return new SectionCursor();
  }
}

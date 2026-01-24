import { Flat3DIndex, Vector3Like } from "@amodx/math";
import { WorldSpaces } from "../WorldSpaces";
import { DataCursorInterface } from "../../Voxels/Cursor/DataCursor.interface";
import { SectionSnapShot } from "./SectionSnapShot";
import { Sector } from "../Sector";
import { SectorCursor } from "../Cursor/SectorCursor";
import { SectionCursor } from "../Cursor/SectionCursor";
import { BoundingBox } from "@amodx/math/Geometry/Bounds/BoundingBox";

const tempPosition = Vector3Like.Create();
export class SectionSnapshotCursor implements DataCursorInterface {
  origin = Vector3Like.Create();
  sectorOrigin = Vector3Like.Create();
  dimension = 0;
  volumeBounds = new BoundingBox();

  sectors: Sector[] = [];
  cursors: SectorCursor[] = [];
  private invSectorSizeX: number = 0;
  private invSectorSizeY: number = 0;
  private invSectorSizeZ: number = 0;

  constructor() {
    // Initialize inverse sizes FIRST
    this.invSectorSizeX = 1 / WorldSpaces.sector.bounds.x;
    this.invSectorSizeY = 1 / WorldSpaces.sector.bounds.y;
    this.invSectorSizeZ = 1 / WorldSpaces.sector.bounds.z;

    const { x: sizeX, y: sizeY, z: sizeZ } = WorldSpaces.sector.bounds;

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          if (
            !WorldSpaces.world.inBounds(
              (x - 1) * sizeX,
              (y - 1) * sizeY,
              (z - 1) * sizeZ,
            )
          )
            continue;
          // Use direct index calculation here — we're iterating grid positions, not world coords
          const sectorIndex = x + y * 3 + z * 9;
          const sector = new Sector();
          sector.setBuffer(Sector.CreateNewBuffer());
          const cursor = new SectorCursor();
          cursor.setSector(sector);
          this.sectors[sectorIndex] = sector;
          this.cursors[sectorIndex] = cursor;
        }
      }
    }
    this.updateBounds();
  }
  private updateBounds() {
    this.volumeBounds.setMinMax(
      Vector3Like.Create(
        WorldSpaces.world.bounds.MinX,
        WorldSpaces.world.bounds.MinY,
        WorldSpaces.world.bounds.MinZ,
      ),
      Vector3Like.Create(
        WorldSpaces.world.bounds.MaxX,
        WorldSpaces.world.bounds.MaxY,
        WorldSpaces.world.bounds.MaxZ,
      ),
    );
    this.invSectorSizeX = 1 / WorldSpaces.sector.bounds.x;
    this.invSectorSizeY = 1 / WorldSpaces.sector.bounds.y;
    this.invSectorSizeZ = 1 / WorldSpaces.sector.bounds.z;
  }
  private _snapShot: SectionSnapShot;
  private _centeralCursor = new SectionCursor();
  getCenteralCursor() {
    const [dim, x, y, z] = this._snapShot.location;

    const sector = this.sectors[this.getSectorIndex(x, y, z)];

    if (!sector) return null;
    const section = sector.getSection(x, y, z);

    if (!section) return null;
    this._centeralCursor.setSection(section);
    return this._centeralCursor;
  }

  setSectionSnapShot(snapShot: SectionSnapShot) {
    this._snapShot = snapShot;
    const {
      x: sectorSizeX,
      y: sectorSizeY,
      z: sectorSizeZ,
    } = WorldSpaces.sector.bounds;
    this.origin.x = snapShot.location[1];
    this.origin.y = snapShot.location[2];
    this.origin.z = snapShot.location[3];

    this.sectorOrigin.x = this.origin.x;
    this.sectorOrigin.y = this.origin.y;
    this.sectorOrigin.z = this.origin.z;
    WorldSpaces.sector.transformPosition(this.sectorOrigin);

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          // Direct index — these are grid positions, not world coords
          const sectorIndex = x + y * 3 + z * 9;
          const sector = this.sectors[sectorIndex];
          if (!sector) continue;
          const secotrPosition = WorldSpaces.sector.getPosition(
            this.sectorOrigin.x + (x - 1) * sectorSizeX,
            this.sectorOrigin.y + (y - 1) * sectorSizeY,
            this.sectorOrigin.z + (z - 1) * sectorSizeZ,
            tempPosition,
          );
          sector.position[0] = secotrPosition.x;
          sector.position[1] = secotrPosition.y;
          sector.position[2] = secotrPosition.z;
          this.cursors[sectorIndex].setSector(sector);
        }
      }
    }

    const {
      x: sectionSizeX,
      y: sectionSizeY,
      z: sectionSizeZ,
    } = WorldSpaces.section.bounds;
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          const sectionX = this.origin.x + (x - 1) * sectionSizeX;
          const sectionY = this.origin.y + (y - 1) * sectionSizeY;
          const sectionZ = this.origin.z + (z - 1) * sectionSizeZ;
          if (!WorldSpaces.world.inBounds(sectionX, sectionY, sectionZ))
            continue;
          const sectorIndex = this.getSectorIndex(sectionX, sectionY, sectionZ);
          const sector = this.sectors[sectorIndex];
          if (!sector) continue;
          const section = sector.getSection(sectionX, sectionY, sectionZ);
          section.updatePosition();
          
          section.view.set(
            snapShot.sections[x + y * 3 + z * 9],
          );
        }
      }
    }
  }

  protected getSectorIndex(x: number, y: number, z: number) {
    const ix = ((x - this.sectorOrigin.x) * this.invSectorSizeX + 1) | 0;
    const iy = ((y - this.sectorOrigin.y) * this.invSectorSizeY + 1) | 0;
    const iz = ((z - this.sectorOrigin.z) * this.invSectorSizeZ + 1) | 0;

    return ix + iy * 3 + iz * 9;
  }

  inBounds(x: number, y: number, z: number) {
    return WorldSpaces.world.inBounds(x, y, z);
  }

  getVoxel(x: number, y: number, z: number) {
    const cursor = this.cursors[this.getSectorIndex(x, y, z)];
    if (!cursor) return null;
    return cursor.getVoxel(x, y, z);
  }

  clone() {
    return new SectionSnapshotCursor();
  }
}

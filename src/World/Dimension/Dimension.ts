import { WorldSpaces } from "../WorldSpaces";
import { DimensionSyncData } from "../Types/WorldData.types";
import { Sector } from "../Sector";

export interface DimensionData {
  id: string;
  index: number;
  sectors: Map<string, Sector>;
}
export interface Dimension extends DimensionData {}

export class Dimension {
  static CreateNew(index: number, id = "") {
    return new Dimension({
      id,
      index,
      sectors: new Map<string, Sector>(),
    });
  }
  _sectorIndex = new Map<number, Map<number, Map<number, Sector>>>();

  constructor(data: DimensionData) {
    return Object.assign(this, data);
  }

  getIndexedSector(sectorX: number, sectorY: number, sectorZ: number) {
    const row = this._sectorIndex.get(sectorX);
    if (!row) return undefined;
    const column = row.get(sectorZ);
    if (!column) return undefined;
    return column.get(sectorY);
  }

  setIndexedSector(
    sectorX: number,
    sectorY: number,
    sectorZ: number,
    sector: Sector
  ) {
    let row = this._sectorIndex.get(sectorX);
    if (!row) {
      row = new Map();
      this._sectorIndex.set(sectorX, row);
    }
    let column = row.get(sectorZ);
    if (!column) {
      column = new Map();
      row.set(sectorZ, column);
    }
    column.set(sectorY, sector);
  }

  deleteIndexedSector(sectorX: number, sectorY: number, sectorZ: number) {
    const row = this._sectorIndex.get(sectorX);
    if (!row) return;
    const column = row.get(sectorZ);
    if (!column) return;
    column.delete(sectorY);
    if (!column.size) row.delete(sectorZ);
    if (!row.size) this._sectorIndex.delete(sectorX);
  }

  set(sectorId: string, region: Sector) {
    this.sectors.set(sectorId, region);
    this.setIndexedSector(
      region.position[0] >> WorldSpaces.sector.power2Axes.x,
      region.position[1] >> WorldSpaces.sector.power2Axes.y,
      region.position[2] >> WorldSpaces.sector.power2Axes.z,
      region
    );
  }
  delete(sectorId: string) {
    const sector = this.sectors.get(sectorId);
    this.sectors.delete(sectorId);
    if (!sector) return;
    this.deleteIndexedSector(
      sector.position[0] >> WorldSpaces.sector.power2Axes.x,
      sector.position[1] >> WorldSpaces.sector.power2Axes.y,
      sector.position[2] >> WorldSpaces.sector.power2Axes.z
    );
  }
  get(sectorId: string) {
    return this.sectors.get(sectorId);
  }

  getData(): DimensionSyncData {
    return {
      id: this.id,
      index: this.index,
    };
  }
}

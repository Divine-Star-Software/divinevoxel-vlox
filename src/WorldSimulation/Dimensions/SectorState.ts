import { Sector } from "../../World/Sector";
import { SimulationSector } from "./SimulationSector";
export class SectorState {
  isLoaded = true;
  isGenerated = true;
  genAllDone = true;
  allLoaded = true;
  nWorldGenAllDone = true;
  nDecorAllDone = true;
  nSunAllDone = true;
  nPropagationAllDone = true;

  constructor(public simSector: SimulationSector) {}
  reset() {
    this.isLoaded = true;
    this.isGenerated = true;
    this.genAllDone = true;
    this.allLoaded = true;
    this.nWorldGenAllDone = true;
    this.nDecorAllDone = true;
    this.nSunAllDone = true;
    this.nPropagationAllDone = true;
  }

  update() {
    if (!this.simSector.sector) throw new Error(`Sector must be set`);
    const state = this;
    state.reset();

    for (const simSector of this.simSector.neighbors) {
      const sector = simSector.sector;

      if (!sector || sector.isCheckedOut()) {
        state.genAllDone = false;
        state.nWorldGenAllDone = false;
        state.nPropagationAllDone = false;
        state.nSunAllDone = false;
        state.nDecorAllDone = false;
        state.allLoaded = false;

        break;
      }

      if (!sector.getBitFlag(Sector.FlagIds.isWorldGenDone)) {
        state.nWorldGenAllDone = false;
      }
      if (!sector.getBitFlag(Sector.FlagIds.isWorldDecorDone)) {
        state.nDecorAllDone = false;
      }
      if (!sector.getBitFlag(Sector.FlagIds.isWorldSunDone)) {
        state.nSunAllDone = false;
      }
      if (!sector.getBitFlag(Sector.FlagIds.isWorldPropagationDone)) {
        state.nPropagationAllDone = false;
      }
    }
    return this;
  }
}

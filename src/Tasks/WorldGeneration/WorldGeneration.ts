//types
//objects
import { WorldGenRegister } from "./WorldGenRegister.js";
//tools
import { WorldGenBrush } from "./WorldGenBrush.js";
import { WorldGenInterface } from "./WorldGen.types.js";
import { WorldRegister } from "../../World/WorldRegister.js";
import { LocationData } from "../../Math/index.js";
import { Sector } from "../../World/index.js";
import { PerfLog } from "../../Util/PerfLog.js";

export class WorldGeneration {
  static worldGen: WorldGenInterface | null = null;

  static register = WorldGenRegister;

  static _brushes: any[] = [];

  static setWorldGen(worldGen: WorldGenInterface) {
    this.worldGen = worldGen;
  }

  static async generate(
    data: Readonly< LocationData>,
    mode: "generate" | "decorate",
    onDone: Function
  ) {
    if (!this.worldGen) {
      throw new Error(`A World Generator must be set.`);
    }

    const requestsId = WorldGenRegister.registerRequest(data);
    for (const brush of this._brushes) {
      brush.requestsId = requestsId;
    }
    const sector = WorldRegister.sectors.get(...data);
    if (!sector) {
      console.error(
        `Error when attempting world gen at [${data.join(",")}] Sector does not exist`
      );
      return;
    }

    const computeStart = PerfLog.now();
    if (mode == "generate") {
      await this.worldGen.generate(...data);
    }
    if (mode == "decorate") {
      await this.worldGen.decorate(...data);
    }
    PerfLog.end(`gen.${mode}.compute`, computeStart);

    const fullFillStart = PerfLog.now();
    const fullFilled = WorldGenRegister.attemptRequestFullFill(requestsId);
    PerfLog.end(`gen.${mode}.requestFullFill`, fullFillStart);
    if (!fullFilled) {
      PerfLog.count(`gen.${mode}.requestsPending`);
      const waitStart = PerfLog.now();
      const readyCheck = () => {
        if (WorldGenRegister.attemptRequestFullFill(requestsId)) {
          PerfLog.end(`gen.${mode}.requestWait`, waitStart);
          if (mode == "generate") {
            sector.setBitFlag(Sector.FlagIds.isWorldGenDone, true);
          }
          if (mode == "decorate") {
            sector.setBitFlag(Sector.FlagIds.isWorldDecorDone, true);
          }
          onDone();
          return;
        }
        setTimeout(readyCheck, 10);
      };
      readyCheck();
    } else {
      if (mode == "generate") {
        sector.setBitFlag(Sector.FlagIds.isWorldGenDone, true);
      }
      if (mode == "decorate") {
        sector.setBitFlag(Sector.FlagIds.isWorldDecorDone, true);
      }
      onDone();
    }
  }

  static getBrush() {
    return new WorldGenBrush();
  }
}

import { SimulationSector } from "./Dimensions/SimulationSector";
import { Thread, ThreadPool } from "@amodx/threads";
import { WorldStorageInterface } from "../World/Types/WorldStorage.interface";
import { TaskTool } from "../Tools/Tasks/TasksTool";
import { Generator, GeneratorData } from "./Dimensions/Generator";
import { WorldSimulationTasks } from "./Internal/WorldSimulationTasks";
import { WorldSimulationTools } from "./Internal/WorldSimulationTools";
import { WorldSimulationDimensions } from "./Internal/WorldSimulationDimensions";
import { Vector3Like } from "@amodx/math";
import { InitialLoad } from "./Procedures/InitialLoad";
import SaveAllSectors from "./Procedures/SaveAllSectors";
import { runActiveSectorUpdate } from "./Internal/runActiveSectorUpdate";
import { WorldRegister } from "../World/WorldRegister";
import { PerfLog } from "../Util/PerfLog";
let lastTickEnd = 0;

interface WorldSimulationInitData {
  parent: Thread;
  generators: Thread | ThreadPool;
  meshers: Thread | ThreadPool;
  worldStorage?: WorldStorageInterface;
}
let initialized = false;
/**# Infinite World Generation IWG
 * Object to handle the loading and generating the world around a created generator.
 */
export class WorldSimulation {
  private static _cullGenerators: Generator[] = [];
  static readonly _generators: Generator[] = [];

  static Tools = WorldSimulationTools;
  static Tasks = WorldSimulationTasks;

  static addDimension(id: number) {
    WorldSimulationDimensions.addDimension(id);
  }

  static Procedures = {
    InitialLoad,
    SaveAllSectors,
  };

  static logTasks() {
    return {
      loading: [
        WorldSimulationTasks.worldLoadTasks.getTotal(0),
        WorldSimulationTasks.worldLoadTasks.getTotalWaitingFor(0),
      ],
      generating: [
        WorldSimulationTasks.worldGenTasks.getTotal(0),
        WorldSimulationTasks.worldGenTasks.getTotalWaitingFor(0),
      ],
      propagating: [
        WorldSimulationTasks.worldPropagationTasks.getTotal(0),
        WorldSimulationTasks.worldPropagationTasks.getTotalWaitingFor(0),
      ],
      sun: [
        WorldSimulationTasks.worldSunTasks.getTotal(0),
        WorldSimulationTasks.worldSunTasks.getTotalWaitingFor(0),
      ],
      building: [
        WorldSimulationTasks.buildTasks.getTotal(0),
        WorldSimulationTasks.buildTasks.getTotalWaitingFor(0),
      ],
      unbuilding: [
        WorldSimulationTasks.unbuildTasks.getTotal(0),
        WorldSimulationTasks.unbuildTasks.getTotalWaitingFor(0),
      ],
    };
  }

  static init(data: WorldSimulationInitData) {
    initialized = true;

    WorldSimulationTools.parent = data.parent;
    WorldSimulationTools.taskTool = new TaskTool(data.meshers, data.generators);
    if (data.worldStorage)
      WorldSimulationTools.worldStorage = data.worldStorage;
  }

  static createGenerator(data: Partial<GeneratorData>) {
    if (!initialized)
      throw new Error(`IWG must be initialized first before creating generator`);
    return new Generator({
      dimension: data.dimension ? data.dimension : 0,
      position: data.position ? data.position : Vector3Like.Create(),
      renderRadius: data.renderRadius ? data.renderRadius : 150,
      tickRadius: data.tickRadius ? data.tickRadius : 150,
      generationRadius: data.generationRadius ? data.generationRadius : 250,
      maxRadius: data.maxRadius ? data.maxRadius : 300,
      building: data.building ? data.building : undefined,
    });
  }

  static addGenerator(generator: Generator) {
    this._generators.push(generator);
    WorldSimulationDimensions.getDimension(generator._dimension)!.addGenerator(
      generator,
    );
  }

  static getDimension(id: number) {
    return WorldSimulationDimensions.getDimension(id);
  }

  static removeGenerator(generator: Generator) {
    WorldSimulationDimensions.getDimension(
      generator._dimension,
    )!.removeGenerator(generator);
    for (let i = 0; i < this._generators.length; i++) {
      if (this._generators[i] == generator) {
        this._generators.splice(i, 1);

        return true;
      }
    }
    return false;
  }

  static doTickUpdates = true;

  static doBuildUpdate = true;

  static clearAll() {
    for (const [, dimension] of WorldSimulationDimensions._dimensions) {
      dimension.clearAll();
    }
    WorldSimulationTools.parent.runTask("clear-all", []);
    const meshers = WorldSimulationTools.taskTool.meshers;
    if (meshers instanceof Thread) {
      meshers.runTask("clear-all", []);
    } else {
      meshers.runTaskForAll("clear-all", []);
    }
    const generators = WorldSimulationTools.taskTool.generators;
    if (generators instanceof Thread) {
      generators.runTask("clear-all", []);
    } else {
      generators.runTaskForAll("clear-all", []);
    }
    WorldRegister.clearAll();
  }

  static tick(generationOnly = false, buildOnly = false) {
    const perfStart = PerfLog.now();
    if (lastTickEnd) PerfLog.time("tick.gap", perfStart - lastTickEnd);
    this._tick(generationOnly, buildOnly);
    lastTickEnd = PerfLog.now();
    PerfLog.time("tick", lastTickEnd - perfStart);
  }

  private static _tick(generationOnly: boolean, buildOnly: boolean) {
    let total = 0;
    const sectorLoopStart = PerfLog.now();
    for (const [, dimension] of WorldSimulationDimensions._dimensions) {
      dimension.incrementTick();
      SimulationSector._firstTickScansLeft =
        SimulationSector.firstTickScansPerTick;
      dimension.simulation.refreshTickCursors();
      if (PerfLog.enabled) {
        PerfLog.gauge("activeSectors", dimension.activeSectors._sectors.length);
        let genAllDone = 0;
        for (let i = 0; i < dimension.activeSectors._sectors.length; i++) {
          if (dimension.activeSectors._sectors[i]._genAllDone) genAllDone++;
        }
        PerfLog.gauge("sectorsGenAllDone", genAllDone);
      }

      for (let i = 0; i < dimension.activeSectors._sectors.length; i++) {
        total += dimension.activeSectors._sectors[i].tickQueue.getTotalTicks();
        if (buildOnly) {
          dimension.activeSectors._sectors[i].updateGenAllDone();
        }
        dimension.activeSectors._sectors[i].tickUpdate(this.doTickUpdates);
        if (!buildOnly) {
          dimension.activeSectors._sectors[i].generateUpdate();
        }
      }
    }

    PerfLog.end("tick.sectorLoop", sectorLoopStart);

    let needActiveSectorUpdate = false;
    for (const gen of this._generators) {
      gen.update();
      if (gen._dirty || gen._isNew) {
        gen._isNew = false;
        gen._dirty = false;
        needActiveSectorUpdate = true;
      }
    }

    if (needActiveSectorUpdate) {
      const activeStart = PerfLog.now();
      runActiveSectorUpdate();
      PerfLog.end("tick.activeSectorUpdate", activeStart);
    }

    if (!buildOnly) {
      WorldSimulationTasks.worldLoadTasks.runTask();
      WorldSimulationTasks.worldGenTasks.runTask();
      WorldSimulationTasks.worldDecorateTasks.runTask();
      WorldSimulationTasks.worldSunTasks.runTask();
      WorldSimulationTasks.worldPropagationTasks.runTask();
    }

    if (generationOnly) return;
    if (this.doBuildUpdate) {
      WorldSimulationTasks.buildTasks.runTask(64);
    }

    if (!buildOnly) {
      WorldSimulationTasks.saveTasks.runTask(50);
      // Saving shares the generator threads with loading and world gen; a
      // lower limit keeps it from starving the terrain ahead of the player.
      WorldSimulationTasks.unloadTasks.runTask(12);
    }
    WorldSimulationTasks.unbuildTasks.runTask();
  }
}

WorldSimulation.addDimension(0);

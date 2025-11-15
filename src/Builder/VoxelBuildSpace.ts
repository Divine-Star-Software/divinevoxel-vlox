import { Vec3Array, Vector3Like } from "@amodx/math";
import { BoundingBox } from "@amodx/math/Geomtry/Bounds/BoundingBox";
import { DivineVoxelEngineRender } from "../Contexts/Render";
import { VoxelPathData } from "../Templates/Path/VoxelPath.types";
import { IVoxelTemplateData } from "../Templates/VoxelTemplates.types";
import { PaintVoxelData } from "../Voxels";
import { VoxelPlacingStrategyRegister } from "../Voxels/Interaction/Placing/VoxelPlacingStrategyRegister";
import { VoxelPickResult } from "../Voxels/Interaction/VoxelPickResult";
import { SchemaRegister } from "../Voxels/State/SchemaRegister";
import { RayProvider } from "./RayProvider";
import { FullVoxelTemplate } from "../Templates/Full/FullVoxelTemplate";
import { BoundsMinMaxData } from "@amodx/math/Geomtry/Bounds/BoundsInterface";
import { FullVoxelTemplateData } from "../Templates/Full/FullVoxelTemplate.types";
import { LocationData } from "../Math";
import type { VoxelSurfaceSelectionData } from "../Templates/Selection/VoxelSurfaceSelection";
import type { VoxelBFSSelectionData } from "../Templates/Selection/VoxelBFSSelection";
import {
  IVoxelSelection,
  IVoxelSelectionData,
} from "../Templates/Selection/VoxelSelection";
import { VoxelShapeTemplate } from "../Templates/Shapes/VoxelShapeTemplate";
import { BoxVoxelShapeSelection } from "../Templates/Shapes/Selections/BoxVoxelShapeSelection";
import "../Templates/VoxelTemplateRegister";
export type VoxelSpaceUpdateData =
  | {
      type: "paint-voxel";
      position: Vec3Array;
      voxel: PaintVoxelData;
    }
  | {
      type: "erase-voxel";
      position: Vec3Array;
    }
  | {
      type: "paint-voxel-template";
      position: Vec3Array;
      template: IVoxelTemplateData<any>;
    }
  | {
      type: "erase-voxel-template";
      position: Vec3Array;
      template: IVoxelTemplateData<any>;
    }
  | {
      type: "erase-voxel-selection";
      selection: IVoxelSelectionData<any>;
    }
  | {
      type: "paint-voxel-path";
      position: Vec3Array;
      path: VoxelPathData;
    }
  | {
      type: "erase-voxel-path";
      position: Vec3Array;
      path: VoxelPathData;
    };
// 1) A helper to map each `type` to its exact update object
type HandlerMap<U extends { type: string }> = {
  [K in U["type"]]: (update: Extract<U, { type: K }>) => Promise<void>;
};
export class VoxelBuildSpace {
  /**Callback that is called before the update is ran. */
  beforeUpdate: ((data: VoxelSpaceUpdateData) => Promise<void> | void) | null =
    null;
  /**Callback that is called durning the update call using Promise.all. */
  duringUpdate: ((data: VoxelSpaceUpdateData) => Promise<void> | void) | null =
    null;
  /**Callback that is called after the update is ran. */
  afterUpdate: ((data: VoxelSpaceUpdateData) => Promise<void> | void) | null =
    null;
  bounds: BoundingBox;

  private _rayProviders: (RayProvider | null)[] = [];

  get rayProvider() {
    return this.getRayProvider(0)!;
  }

  constructor(
    public DVER: DivineVoxelEngineRender,
    rayProvider: RayProvider,
    min = Vector3Like.Create(-Infinity, -Infinity, -Infinity),
    max = Vector3Like.Create(Infinity, Infinity, Infinity)
  ) {
    this.bounds = new BoundingBox(min, max);
    this.addRayProvider(0, rayProvider);
  }

  addRayProvider(index: number, provider: RayProvider) {
    this._rayProviders[index] = provider;
  }
  getRayProvider(index: number): RayProvider | null {
    return this._rayProviders[index];
  }
  removeRayProvider(index: number) {
    this._rayProviders[index] = null;
  }

  /**Pick the current voxel space. Defaults to the rayProvider values. */
  async pick(
    rayOrigin: Vector3Like = this.rayProvider.origin,
    rayDirection: Vector3Like = this.rayProvider.direction,
    length: number = this.rayProvider.length
  ): Promise<VoxelPickResult | null> {
    const pickedVoxel = await this.DVER.threads.world.runTaskAsync(
      "pick-voxel",
      [
        [rayOrigin.x, rayOrigin.y, rayOrigin.z],
        [rayDirection.x, rayDirection.y, rayDirection.z],
        length,
      ]
    );

    if (pickedVoxel === null) {
      return null;
    }

    return VoxelPickResult.FromJSON(pickedVoxel);
  }

  async pickWithProvider(index: number) {
    const provider = this.getRayProvider(index);
    if (!provider) {
      throw new Error(`Ray Provider at index ${index} is not set`);
    }
    return await this.pick(
      provider.origin,
      this.rayProvider.direction,
      this.rayProvider.length
    );
  }

  async createTemplate(bounds: BoundsMinMaxData): Promise<FullVoxelTemplate> {
    const templateData = await this.DVER.threads.world.runTaskAsync<
      [LocationData, BoundsMinMaxData],
      FullVoxelTemplateData
    >("create-voxel-template", [
      [0, ...Vector3Like.ToArray(bounds.min)],
      bounds,
    ]);
    return new FullVoxelTemplate(templateData);
  }

  async getSurfaceSelection(
    position: Vector3Like,
    normal: Vector3Like,
    extrusion: number,
    maxSize?: number
  ): Promise<VoxelSurfaceSelectionData> {
    return await this.DVER.threads.world.runTaskAsync(
      "get-voxel-surface-selection",
      [position, normal, extrusion, maxSize]
    );
  }
  async getBFSSelection(
    position: Vector3Like,
    maxSize?: number
  ): Promise<VoxelBFSSelectionData> {
    return await this.DVER.threads.world.runTaskAsync(
      "get-voxel-bfs-selection",
      [position, maxSize]
    );
  }

  async getExtrudedSelectionTemplate(
    selection: IVoxelSelectionData<any>,
    nomral: Vector3Like
  ) {
    const templateData = await this.DVER.threads.world.runTaskAsync(
      "get-extruded-voxel-selection-template",
      [selection, nomral]
    );
    return new FullVoxelTemplate(templateData);
  }

  getPlaceState(
    data: PaintVoxelData,
    picked: VoxelPickResult,
    alt: number | null = null
  ) {
    const strategy = VoxelPlacingStrategyRegister.get(data.id);
    if (!strategy) return data;
    const state = strategy.getState(picked, alt);
    if (!state) {
      data.state = 0;
      return data;
    }

    const schema = SchemaRegister.getVoxelSchemas(data.id);
    data.state = schema.state.readString(state);
  }

  async clear() {
    const size = this.bounds.size;
    if (!isFinite(size.x) || !isFinite(size.y) || !isFinite(size.z))
      return false;
    const min = this.bounds.min;
    await this.DVER.threads.world.runTaskAsync("erase-voxel-template", [
      [0, min.x, min.y, min.z],
      VoxelShapeTemplate.CreateNew({
        shapeSelection: BoxVoxelShapeSelection.CreateNew({
          width: this.bounds.size.x,
          height: this.bounds.size.y,
          depth: this.bounds.size.z,
        }),
      }),
    ]);
    return true;
  }

  private _updateFunctions: HandlerMap<VoxelSpaceUpdateData> = {
    "paint-voxel": async (update) => {
      await this.DVER.threads.world.runTaskAsync("paint-voxel", [
        [0, ...update.position],
        PaintVoxelData.ToRaw(update.voxel),
      ]);
    },
    "erase-voxel": async (update) => {
      await this.DVER.threads.world.runTaskAsync("erase-voxel", [
        0,
        ...update.position,
      ]);
    },
    "paint-voxel-template": async (update) => {
      await this.DVER.threads.world.runTaskAsync("paint-voxel-template", [
        [0, ...update.position],
        update.template,
      ]);
    },
    "erase-voxel-template": async (update) => {
      await this.DVER.threads.world.runTaskAsync("erase-voxel-template", [
        [0, ...update.position],
        update.template,
      ]);
    },
    "erase-voxel-selection": async (update) => {
      await this.DVER.threads.world.runTaskAsync("erase-voxel-selection", [
        [
          0,
          update.selection.origin.x,
          update.selection.origin.y,
          update.selection.origin.z,
        ],
        update.selection,
      ]);
    },
    "paint-voxel-path": async (update) => {
      await this.DVER.threads.world.runTaskAsync("paint-voxel-path", [
        [0, ...update.position],
        update.path,
      ]);
    },
    "erase-voxel-path": async (update) => {
      await this.DVER.threads.world.runTaskAsync("erase-voxel-path", [
        [0, ...update.position],
        update.path,
      ]);
    },
  };

  async update<T extends VoxelSpaceUpdateData>(data: T) {
    if (this.beforeUpdate) await this.beforeUpdate(data);

    const run = this._updateFunctions[data.type] as (u: T) => Promise<void>;

    if (this.duringUpdate) {
      await Promise.all([run(data), this.duringUpdate(data)]);
    } else {
      await run(data);
    }

    if (this.afterUpdate) await this.afterUpdate(data);
  }

  async paintVoxel(position: Vec3Array | Vector3Like, voxel: PaintVoxelData) {
    await this.update({
      type: "paint-voxel",
      position: Array.isArray(position)
        ? position
        : Vector3Like.ToArray(position),
      voxel,
    });
  }

  async eraseVoxel(position: Vec3Array | Vector3Like) {
    await this.update({
      type: "erase-voxel",
      position: Array.isArray(position)
        ? position
        : Vector3Like.ToArray(position),
    });
  }

  async paintTemplate(
    position: Vec3Array | Vector3Like | Vector3Like,
    template: IVoxelTemplateData<any>
  ) {
    await this.update({
      type: "paint-voxel-template",
      position: Array.isArray(position)
        ? position
        : Vector3Like.ToArray(position),
      template,
    });
  }

  async eraseTemplate(
    position: Vec3Array | Vector3Like,
    template: IVoxelTemplateData<any>
  ) {
    await this.update({
      type: "erase-voxel-template",
      position: Array.isArray(position)
        ? position
        : Vector3Like.ToArray(position),
      template,
    });
  }
  async eraseSelection(selection: IVoxelSelectionData<any>) {
    await this.update({
      type: "erase-voxel-selection",
      selection,
    });
  }
  async paintPath(position: Vec3Array | Vector3Like, path: VoxelPathData) {
    await this.update({
      type: "paint-voxel-path",
      position: Array.isArray(position)
        ? position
        : Vector3Like.ToArray(position),
      path,
    });
  }

  async erasePath(position: Vec3Array | Vector3Like, path: VoxelPathData) {
    await this.update({
      type: "erase-voxel-path",
      position: Array.isArray(position)
        ? position
        : Vector3Like.ToArray(position),
      path,
    });
  }
}

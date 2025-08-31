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
import { LocationData } from "Math";
import {
  VoxelSurfaceSelection,
  VoxelSurfaceSelectionData,
} from "Templates/Selection/VoxelSurfaceSelection";
import { VoxelBFSSelectionData } from "Templates/Selection/VoxelBFSSelection";
export type VoxelSpaceUpdateData =
  | {
      type: "clear";
    }
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
      type: "paint-voxel-path";
      position: Vec3Array;
      path: VoxelPathData;
    }
  | {
      type: "erase-voxel-path";
      position: Vec3Array;
      path: VoxelPathData;
    };

export class VoxelBuildSpace {
  beforeUpdate: (data: VoxelSpaceUpdateData) => void;
  afterUpdate: (data: VoxelSpaceUpdateData) => void;
  bounds: BoundingBox;

  constructor(
    public DVER: DivineVoxelEngineRender,
    public rayProvider: RayProvider,
    min = Vector3Like.Create(-Infinity, -Infinity, -Infinity),
    max = Vector3Like.Create(Infinity, Infinity, Infinity)
  ) {
    this.bounds = new BoundingBox(min, max);
  }

  async pick(
    rayOrigin: Vector3Like,
    rayDirection: Vector3Like,
    length: number
  ) {
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
  async getSurfaceSelectionTemplate(
    position: Vector3Like,
    normal: Vector3Like,
    extrusion: number,
    maxSize: number,
    voxelDataOrExtrude: true | PaintVoxelData
  ): Promise<FullVoxelTemplate> {
    return new FullVoxelTemplate(
      await this.DVER.threads.world.runTaskAsync(
        "get-voxel-surface-selection-template",
        [position, normal, extrusion, maxSize, voxelDataOrExtrude]
      )
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
  async getBFSSelectionTemplate(
    position: Vector3Like,
    maxSize?: number
  ): Promise<FullVoxelTemplate> {
    return new FullVoxelTemplate(
      await this.DVER.threads.world.runTaskAsync(
        "get-voxel-bfs-selection-template",
        [position, maxSize]
      )
    );
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

  private async _update(update: VoxelSpaceUpdateData) {
    if (update.type == "paint-voxel") {
      await this.DVER.threads.world.runTaskAsync("paint-voxel", [
        [0, ...update.position],
        PaintVoxelData.ToRaw(update.voxel),
      ]);
      return;
    }
    if (update.type == "erase-voxel") {
      await this.DVER.threads.world.runTaskAsync("erase-voxel", [
        0,
        ...update.position,
      ]);
      return;
    }
    if (update.type == "paint-voxel-template") {
      await this.DVER.threads.world.runTaskAsync("paint-voxel-template", [
        [0, ...update.position],
        update.template,
      ]);
      return;
    }
    if (update.type == "erase-voxel-template") {
      await this.DVER.threads.world.runTaskAsync("erase-voxel-template", [
        [0, ...update.position],
        update.template,
      ]);
      return;
    }
    if (update.type == "paint-voxel-path") {
      await this.DVER.threads.world.runTaskAsync("paint-voxel-path", [
        [0, ...update.position],
        update.path,
      ]);
      return;
    }
    if (update.type == "erase-voxel-path") {
      await this.DVER.threads.world.runTaskAsync("erase-voxel-path", [
        [0, ...update.position],
        update.path,
      ]);
      return;
    }
  }

  private async _doUpdate(data: VoxelSpaceUpdateData) {
    if (this.beforeUpdate) this.beforeUpdate(data);
    await this._update(data);
    if (this.afterUpdate) this.afterUpdate(data);
  }

  async paintVoxel(position: Vec3Array | Vector3Like, voxel: PaintVoxelData) {
    await this._doUpdate({
      type: "paint-voxel",
      position: Array.isArray(position)
        ? position
        : Vector3Like.ToArray(position),
      voxel,
    });
  }

  async eraseVoxel(position: Vec3Array | Vector3Like) {
    await this._doUpdate({
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
    await this._doUpdate({
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
    await this._doUpdate({
      type: "erase-voxel-template",
      position: Array.isArray(position)
        ? position
        : Vector3Like.ToArray(position),
      template,
    });
  }

  async paintPath(position: Vec3Array | Vector3Like, path: VoxelPathData) {
    await this._doUpdate({
      type: "paint-voxel-path",
      position: Array.isArray(position)
        ? position
        : Vector3Like.ToArray(position),
      path,
    });
  }

  async erasePath(position: Vec3Array | Vector3Like, path: VoxelPathData) {
    await this._doUpdate({
      type: "erase-voxel-path",
      position: Array.isArray(position)
        ? position
        : Vector3Like.ToArray(position),
      path,
    });
  }
}

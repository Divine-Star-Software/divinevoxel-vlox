import { WorldSimulation } from "../../WorldSimulation";
import { Threads } from "@amodx/threads";
import { LocationData } from "../../Math";
import { PaintVoxelData, RawVoxelData } from "../../Voxels";
import { Vec3Array, Vector3Like } from "@amodx/math";
import { IVoxelTemplateData } from "../../Templates/VoxelTemplates.types";
import { VoxelPathData } from "../../Templates/Path/VoxelPath.types";
import { VoxelTemplateRegister } from "../../Templates/VoxelTemplateRegister";
import { VoxelPath } from "../../Templates/Path/VoxelPath";
import { VoxelUpdateData } from "../../Tasks/Tasks.types";
import PickVoxelWorld from "../../Voxels/Interaction/Functions/PickVoxelWorld";
import { WorldCursor } from "../../World";

import LockSectors from "../../World/Lock/Function/LockSectors";
import UnLockSectors from "../../World/Lock/Function/UnLockSectors";
import { BoundingBox } from "@amodx/math/Geomtry/Bounds/BoundingBox";
import { VoxelSurfaceSelection } from "../../Templates/Selection/VoxelSurfaceSelection";
import { VoxelBFSSelection } from "../../Templates/Selection/VoxelBFSSelection";
import CreateFullTemplate from "../../Templates/Full/Functions/CreateFullTemplate";
import { BoundsMinMaxData } from "@amodx/math/Geomtry/Bounds/BoundsInterface";
import { FullVoxelTemplateData } from "../../Templates/Full/FullVoxelTemplate.types";
import { IVoxelSelectionData } from "../../Templates/Selection/VoxelSelection";
import { ExtrudeSelection } from "../../Templates/Functions/ExtrudeSelection";

export function InitTasks() {
  const dimension = WorldSimulation.getDimension(0);
  const brush = dimension.getBrush();
  const cursor = new WorldCursor();

  const surfaceSelection = new VoxelSurfaceSelection();
  const bfsSelection = new VoxelBFSSelection();

  const updateData: VoxelUpdateData = {
    includedAreas: [],
  };
  const buildAreaBounds = new BoundingBox();

  Threads.registerTask<[min: Vector3Like, max: Vector3Like], any>(
    "get-box-area-template",
    async ([min, max]) => {
      await LockSectors(cursor.dimension, buildAreaBounds);
      const archived = CreateFullTemplate(cursor, { min, max });
      await UnLockSectors(cursor.dimension, buildAreaBounds);
      return [archived];
    }
  );

  Threads.registerTask<[min: Vec3Array, max: Vec3Array]>(
    "set-build-area",
    async ([min, max]) => {
      buildAreaBounds.setMinMax(
        Vector3Like.Create(...min),
        Vector3Like.Create(...max)
      );
      updateData.includedAreas = [[min, max]];
    }
  );

  Threads.registerTask<
    [position: Vec3Array, direction: Vec3Array, length: number],
    any
  >("pick-voxel", async ([position, direction, length]) => {
    const pickedVoxel = await PickVoxelWorld(
      cursor,
      position,
      direction,
      length
    );
    //pick voxels error when not using shared memory if the secotrs are check out
    return [pickedVoxel?.toJSON() || null];
  });

  /**
   * Selections
   */
  Threads.registerTask<
    [
      position: Vector3Like,
      normal: Vector3Like,
      extrusion: number,
      maxSize?: number
    ]
  >(
    "get-voxel-surface-selection",
    async ([position, normal, extrusion, maxSize]) => {
      await LockSectors(cursor.dimension, buildAreaBounds);
      surfaceSelection.reConstruct(
        cursor,
        position,
        normal,
        extrusion,
        maxSize
      );
      await UnLockSectors(cursor.dimension, buildAreaBounds);
      return [surfaceSelection.toJSON()];
    }
  );

  Threads.registerTask<[data: IVoxelSelectionData<any>, normal: Vector3Like]>(
    "get-extruded-voxel-selection-template",
    async ([selectionData, normal]) => {
      const selection = VoxelTemplateRegister.createSelection(selectionData);
      await LockSectors(cursor.dimension, selection.bounds);
      const fullVoxelTemplate = ExtrudeSelection(cursor, selection, normal);
      await UnLockSectors(cursor.dimension, selection.bounds);

      return [fullVoxelTemplate.toJSON()];
    }
  );

  Threads.registerTask<[position: Vector3Like, maxSize?: number]>(
    "get-voxel-bfs-selection",
    async ([position, maxSize]) => {
      await LockSectors(cursor.dimension, buildAreaBounds);
      bfsSelection.reConstruct(cursor, position, maxSize);
      await UnLockSectors(cursor.dimension, buildAreaBounds);
      return [bfsSelection.toJSON()];
    }
  );

  /**
   * Painting
   */
  Threads.registerTask<[LocationData, RawVoxelData]>(
    "paint-voxel",
    async ([location, raw]) => {
      await LockSectors(location[0], buildAreaBounds);
      brush.setXYZ(location[1], location[2], location[3]);
      brush.setRaw(raw);
      brush.paint(updateData);
      await UnLockSectors(location[0], buildAreaBounds);
    }
  );

  Threads.registerTask<LocationData>("erase-voxel", async (location) => {
    await LockSectors(location[0], buildAreaBounds);
    brush.dimension = location[0];
    brush.setXYZ(location[1], location[2], location[3]);
    brush.erase(updateData);
    await UnLockSectors(location[0], buildAreaBounds);
  });

  Threads.registerTask<
    [location: LocationData, BoundsMinMaxData],
    FullVoxelTemplateData
  >("create-voxel-template", async ([location, bounds]) => {
    const boundingBox = new BoundingBox(bounds.min, bounds.max);
    await LockSectors(location[0], boundingBox);
    const template = CreateFullTemplate(cursor, bounds);
    await UnLockSectors(location[0], boundingBox);
    return [template];
  });

  Threads.registerTask<[location: LocationData, data: IVoxelTemplateData<any>]>(
    "paint-voxel-template",
    async ([location, data]) => {
      const template = VoxelTemplateRegister.create(data);
      brush.dimension = location[0];
      await LockSectors(location[0], template.bounds);
      brush
        .setXYZ(location[1], location[2], location[3])
        .paintTemplate(template, updateData);
      await UnLockSectors(location[0], template.bounds);
    }
  );

  Threads.registerTask<[location: LocationData, data: IVoxelTemplateData<any>]>(
    "erase-voxel-template",
    async ([location, data]) => {
      brush.dimension = location[0];
      const template = VoxelTemplateRegister.create(data);
      await LockSectors(location[0], template.bounds);
      brush
        .setXYZ(location[1], location[2], location[3])
        .eraseTemplate(template, updateData);
      await UnLockSectors(location[0], template.bounds);
    }
  );
  Threads.registerTask<
    [location: LocationData, data: IVoxelSelectionData<any>]
  >("erase-voxel-selection", async ([location, selectionData]) => {
    brush.dimension = location[0];
    const selection = VoxelTemplateRegister.createSelection(selectionData);
    await LockSectors(location[0], selection.bounds);
    brush
      .setXYZ(location[1], location[2], location[3])
      .eraseSelection(selection, updateData);
    await UnLockSectors(location[0], selection.bounds);
  });

  Threads.registerTask<[location: LocationData, data: VoxelPathData]>(
    "paint-voxel-path",
    async ([location, data]) => {
      await LockSectors(location[0], buildAreaBounds);
      brush.dimension = location[0];
      brush
        .setXYZ(location[1], location[2], location[3])
        .paintPath(new VoxelPath(data), updateData);
      await UnLockSectors(location[0], buildAreaBounds);
    }
  );

  Threads.registerTask<[location: LocationData, data: VoxelPathData]>(
    "erase-voxel-path",
    async ([location, data]) => {
      await LockSectors(location[0], buildAreaBounds);
      brush.dimension = location[0];
      brush
        .setXYZ(location[1], location[2], location[3])
        .erasePath(new VoxelPath(data), updateData);
      await UnLockSectors(location[0], buildAreaBounds);
    }
  );
}

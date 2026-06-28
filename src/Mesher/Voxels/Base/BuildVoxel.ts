import { VoxelLUT } from "../../../Voxels/Data/VoxelLUT";
import { GeometryLUT } from "../../../Voxels/Data/GeometryLUT";
import { VoxelGeometryConstructorRegister } from "../Models/VoxelGeometryConstructorRegister";

import { SectionCursor } from "../../../World/Cursor/SectionCursor.js";

import { WorldVoxelCursor } from "../../../World/Cursor/WorldVoxelCursor";

import { DataCursorInterface } from "../../../Voxels/Cursor/DataCursor.interface";
import { VoxelModelBuilder } from "../Models/VoxelModelBuilder";
import { RenderedMaterials } from "../Models/RenderedMaterials";
import { Vector3Like } from "@amodx/math";
import { VoxelCursorInterface } from "Voxels/Cursor/VoxelCursor.interface";

export function BuildVoxelBase(builder: VoxelModelBuilder, secondary = false) {
  let added = false;
  const hashed = builder.space.getHash(
    builder.nVoxel,
    builder.position.x,
    builder.position.y,
    builder.position.z,
  );

  if (secondary && !builder.space.getHasSecondary(hashed)) return false;

  const trueVoxelId = builder.space.getTrueVoxelId(hashed, secondary);
  const voxelId = builder.space.getVoxelId(hashed, secondary);
  const reltionalVoxelId = builder.space.getRelationalVoxelId(
    hashed,
    secondary,
  );

  const geomtriesIndex = VoxelLUT.getGeometryIndex(voxelId, reltionalVoxelId);
  const geomtries = GeometryLUT.geometryIndex[geomtriesIndex];

  const inputsIndex = VoxelLUT.getGeometryInputIndex(voxelId, reltionalVoxelId);
  const inputs = GeometryLUT.geometryInputsIndex[inputsIndex];

  const geometriesLength = geomtries.length;

  for (let i = 0; i < geometriesLength; i++) {
    const nodeId = geomtries[i];
    const inputsIndex = inputs[i];
    const geoInputs = GeometryLUT.geometryInputs[inputsIndex];
    const geometry = VoxelGeometryConstructorRegister.geometry[nodeId];
    const nodesLength = geometry.nodes.length;
    for (let k = 0; k < nodesLength; k++) {
      const geo = geometry.nodes[k];
      geo.builder = builder;
      const addedGeo = geo.add(geoInputs[k]);
      if (addedGeo) added = true;
    }
  }

  const conditioanlNodes = VoxelLUT.getConditionalGeometryNodes(
    VoxelLUT.modelsIndex[trueVoxelId],
  );
  if (conditioanlNodes) {
    const modelState = VoxelLUT.voxelIdToState[voxelId];
    const reltionalState = builder.space.getRelationalState(hashed, secondary);
    const nodesLength = conditioanlNodes.length;

    for (let i = 0; i < nodesLength; i++) {
      const [geoId, requiredModelState, requiredModelReltionalState] =
        conditioanlNodes[i];
      if (
        requiredModelState !== modelState ||
        !requiredModelReltionalState[reltionalState]
      )
        continue;

      const geomtries = GeometryLUT.geometryIndex[geoId];
      const inputsIndex = VoxelLUT.getConditionalGeometryInputIndex(
        geoId,
        voxelId,
        reltionalVoxelId,
      );

      const inputs = GeometryLUT.geometryInputsIndex[inputsIndex];

      const geometriesLength = geomtries.length;

      for (let i = 0; i < geometriesLength; i++) {
        const nodeId = geomtries[i];
        const inputsIndex = inputs[i];
        const geoInputs = GeometryLUT.geometryInputs[inputsIndex];
        const geometry = VoxelGeometryConstructorRegister.geometry[nodeId];
        const nodesLength = geometry.nodes.length;
        for (let k = 0; k < nodesLength; k++) {
          const geo = geometry.nodes[k];
          geo.builder = builder;
          const addedGeo = geo.add(geoInputs[k]);
          if (addedGeo) added = true;
        }
      }
    }
  }

  /*     this.effects.addEffects(
      builder.voxel.getState(),
      builder.origin,
      builder.effects
    ); */

  builder.clearCalculatedData();

  return added;
}

export function BuildVoxel(
  x: number,
  y: number,
  z: number,
  voxel: VoxelCursorInterface,
  worldCursor: DataCursorInterface,
  origin: Vector3Like,
): boolean {
  const builder =
    RenderedMaterials.meshers[VoxelLUT.materialMap[voxel.getVoxelId()]];
  builder.origin.x = origin.x;
  builder.origin.y = origin.y;
  builder.origin.z = origin.z;
  builder.position.x = x;
  builder.position.y = y;
  builder.position.z = z;
  builder.voxel = voxel;
  builder.nVoxel = worldCursor;
  builder.startConstruction();
  const added = BuildVoxelBase(builder);
  builder.endConstruction();
  let addedSecondary = false;

  if (voxel.canHaveSecondaryVoxel()) {
    voxel.setSecondary(true);
    const builder =
      RenderedMaterials.meshers[VoxelLUT.materialMap[voxel.getVoxelId()]];

    builder.origin.x = origin.x;
    builder.origin.y = origin.y;
    builder.origin.z = origin.z;
    builder.position.x = x;
    builder.position.y = y;
    builder.position.z = z;
    builder.voxel = voxel;
    builder.nVoxel = worldCursor;
    builder.startConstruction();
    addedSecondary = BuildVoxelBase(builder, true);
    builder.endConstruction();
    voxel.setSecondary(false);
  }

  return added || addedSecondary;
}

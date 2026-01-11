import { VoxelRelativeCubeIndexPositionMap } from "../../../../../Voxels/Geometry/VoxelRelativeCubeIndex";
import { VoxelModelBuilder } from "../../VoxelModelBuilder";
import { GeometryLUT } from "../../../../../Voxels/Data/GeometryLUT";
import { getInterpolationValue } from "../Calc/CalcConstants";
import { Vec4Array } from "@amodx/math";
import { QuadVerticies } from "../../../../Geometry/Geometry.types";
import { VoxelLUT } from "../../../../../Voxels/Data/VoxelLUT";

export function ShadeRulledFace(
  builder: VoxelModelBuilder,
  trueFaceIndex: number,
  lightData: Record<QuadVerticies, number>,
  vertexWeights: Vec4Array[],
  vertexStride: number
) {
  const noAO = builder.voxel.isLightSource() || builder.voxel.noAO();

  const worldLight = builder.vars.light;
  const worldAO = builder.vars.ao;

  for (let v = 0; v < vertexStride; v++) {
    worldAO.vertices[v] = 0;

    worldLight.vertices[v] = getInterpolationValue(
      lightData as Vec4Array,
      vertexWeights[v]
    );

    if (noAO) continue;

    const aoIndexes = GeometryLUT.aoVertexHitMap![trueFaceIndex][v];

    if (!aoIndexes) continue;

    for (let i = 0; i < aoIndexes.length; i++) {
      const directionIndex = aoIndexes[i];
      const p = VoxelRelativeCubeIndexPositionMap[directionIndex];

      const hashed = builder.space.getHash(
        builder.nVoxel,
        builder.position.x + p[0],
        builder.position.y + p[1],
        builder.position.z + p[2]
      );

      if (
        builder.space.foundHash[hashed] < 2 ||
        builder.space.noCastAO[hashed] === 1
      )
        continue;

      const voxelId = builder.space.voxelCache[hashed];
      const reltionalVoxelId = builder.space.reltionalVoxelCache[hashed];
      const geometryIndex = VoxelLUT.getGeometryIndex(voxelId, reltionalVoxelId);
      const baseGeo = GeometryLUT.geometryIndex[geometryIndex];

      //  if (!baseGeo && !conditonalGeo) continue;
      let shaded = false;
      if (baseGeo) {
        for (let geoIndex = 0; geoIndex < baseGeo.length; geoIndex++) {
          if (
            GeometryLUT.aoIndex.getValue(
              baseGeo[geoIndex],
              directionIndex,
              trueFaceIndex,
              v
            )
          ) {
            worldAO.vertices[v]++;
            if (worldAO.vertices[v] >= 3) {
              shaded = true;
              break;
            }
          }
        }
      }
      if (shaded) continue;

      const trueVoxelId = builder.space.trueVoxelCache[hashed];
      const offsetConditonalGeometry =
        VoxelLUT.getConditionalGeometryNodes(trueVoxelId);

      if (offsetConditonalGeometry) {
        const modelState = VoxelLUT.voxelIdToModelState[voxelId];
        const reltioanlModSeltate = builder.space.reltionalStateCache[hashed];
        for (let i = 0; i < offsetConditonalGeometry.length; i++) {
          const [geoId, requiredModelState, requiredReltionalModelState] =
            offsetConditonalGeometry[i];
          if (
            requiredModelState !== modelState ||
            !requiredReltionalModelState[reltioanlModSeltate]
          )
            continue;

          const geomerties = GeometryLUT.geometryIndex[geoId];
          for (let geoIndex = 0; geoIndex < geomerties.length; geoIndex++) {
            const geoId = geomerties[geoIndex];
            if (
              GeometryLUT.aoIndex.getValue(
                geoId,
                directionIndex,
                trueFaceIndex,
                v
              )
            ) {
              worldAO.vertices[v]++;
              if (worldAO.vertices[v] >= 3) {
                shaded = true;
                break;
              }
            }
          }
        }
      }
    }
  }
}

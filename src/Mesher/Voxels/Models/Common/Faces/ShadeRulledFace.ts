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
  vertexStride: number,
) {
  const voxel = builder.voxel;
  const noAO = voxel.isLightSource() || voxel.noAO();

  const worldLightVerts = builder.vars.light.vertices;
  const worldAOVerts = builder.vars.ao.vertices;

  const space = builder.space;
  const foundHash = space.foundHash;
  const noCastAO = space.noCastAO;
  const voxelCache = space.voxelCache;
  const trueVoxelCache = space.trueVoxelCache;
  const reltionalVoxelCache = space.reltionalVoxelCache;
  const reltionalStateCache = space.reltionalStateCache;

  const posX = builder.position.x;
  const posY = builder.position.y;
  const posZ = builder.position.z;
  const nVoxel = builder.nVoxel;

  const aoVertexHitMap = GeometryLUT.aoVertexHitMap!;
  const geometryIndex = GeometryLUT.geometryIndex;
  const aoIndex = GeometryLUT.aoIndex;
  const voxelIdToState = VoxelLUT.voxelIdToState;

  for (let v = 0; v < vertexStride; v++) {
    worldAOVerts[v] = 0;
    worldLightVerts[v] = getInterpolationValue(
      lightData as Vec4Array,
      vertexWeights[v],
    );

    if (noAO) continue;

    const aoIndexes = aoVertexHitMap[trueFaceIndex][v];
    if (!aoIndexes) continue;

    for (let i = 0; i < aoIndexes.length; i++) {
      const directionIndex = aoIndexes[i];
      const p = VoxelRelativeCubeIndexPositionMap[directionIndex];

      const hashed = space.getHash(
        nVoxel,
        posX + p[0],
        posY + p[1],
        posZ + p[2],
      );

      if (foundHash[hashed] < 2 || noCastAO[hashed] === 1) continue;

      const voxelId = voxelCache[hashed];
      const reltionalVoxelId = reltionalVoxelCache[hashed];
      const geoIdx = VoxelLUT.getGeometryIndex(voxelId, reltionalVoxelId);
      const baseGeo = geometryIndex[geoIdx];

      let shaded = false;
      if (baseGeo) {
        for (let geoIndex = 0; geoIndex < baseGeo.length; geoIndex++) {
          if (
            aoIndex.getValue(
              baseGeo[geoIndex],
              directionIndex,
              trueFaceIndex,
              v,
            )
          ) {
            if (++worldAOVerts[v] >= 3) {
              shaded = true;
              break;
            }
          }
        }
      }
      if (shaded) continue;

      const trueVoxelId = trueVoxelCache[hashed];
      const offsetConditonalGeometry =
        VoxelLUT.getConditionalGeometryNodes(trueVoxelId);

      if (offsetConditonalGeometry) {
        const modelState = voxelIdToState[voxelId];
        const relationalModState = reltionalStateCache[hashed];

        for (let j = 0; j < offsetConditonalGeometry.length; j++) {
          const [geoId, requiredModelState, requiredReltionalModelState] =
            offsetConditonalGeometry[j];
          if (
            requiredModelState !== modelState ||
            !requiredReltionalModelState[relationalModState]
          )
            continue;

          const geometries = geometryIndex[geoId];
          for (let k = 0; k < geometries.length; k++) {
            if (
              aoIndex.getValue(geometries[k], directionIndex, trueFaceIndex, v)
            ) {
              if (++worldAOVerts[v] >= 3) {
                shaded = true;
                break;
              }
            }
          }
          if (shaded) break;
        }
      }
    }
  }
}

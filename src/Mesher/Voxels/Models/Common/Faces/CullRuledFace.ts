import { VoxelLUT } from "../../../../../Voxels/Data/VoxelLUT";
import { GeometryLUT } from "../../../../../Voxels/Data/GeometryLUT";
import { VoxelRelativeCubeIndexPositionMap } from "../../../../../Voxels/Geometry/VoxelRelativeCubeIndex";
import { VoxelModelBuilder } from "../../VoxelModelBuilder";

export function CullRulledFace(
  builder: VoxelModelBuilder,
  trueFaceIndex: number,
) {
  const faceCullMap = GeometryLUT.faceCullMap!;
  const faceIndexes = faceCullMap[trueFaceIndex];
  if (!faceIndexes) return true;

  const space = builder.space;
  const foundHash = space.foundHash;

  const posX = builder.position.x;
  const posY = builder.position.y;
  const posZ = builder.position.z;
  const nVoxel = builder.nVoxel;

  const geometryIndexLUT = GeometryLUT.geometryIndex;
  const rulelessIndex = GeometryLUT.rulelessIndex;
  const cullingProcedures = GeometryLUT.geometryCullingProcedures;
  const cullingProceduresIndex = GeometryLUT.geometryCullingProceduresIndex;
  const faceCullIndex = GeometryLUT.faceCullIndex;
  const voxelIdToState = VoxelLUT.voxelIdToState;

  const currentVoxelId = builder.voxel.getVoxelId();

  for (let i = 0; i < faceIndexes.length; i++) {
    const directionIndex = faceIndexes[i];
    const p = VoxelRelativeCubeIndexPositionMap[directionIndex];
    const hashed = space.getHash(nVoxel, posX + p[0], posY + p[1], posZ + p[2]);
      if (foundHash[hashed] < 2) continue;
    let count =  1;

    for (let s = 0; s < count; s++) {
      let secondary = s == 1 ? true : false;

      const voxelId = space.getVoxelId(hashed, secondary);
      const reltionalVoxelId = space.getRelationalVoxelId(hashed, secondary);
      const geometryIndex = VoxelLUT.getGeometryIndex(
        voxelId,
        reltionalVoxelId,
      );
      const offsetBaseGeometry = geometryIndexLUT[geometryIndex];

      if (offsetBaseGeometry) {
        for (let j = 0; j < offsetBaseGeometry.length; j++) {
          const geoId = offsetBaseGeometry[j];
          if (rulelessIndex[geoId]) continue;

          const cullingProcedure =
            cullingProcedures[cullingProceduresIndex[geoId]];
          const procType = cullingProcedure.type;

          if (procType === "transparent") {
            if (space.getTrueVoxelId(hashed, secondary) !== currentVoxelId)
              continue;
          }
          if (procType == "none") {
            continue;
          }

          if (
            faceCullIndex.getValue(geoId, directionIndex, trueFaceIndex) === 1
          ) {
            return false;
          }
        }
      }

      const trueVoxelId = space.getTrueVoxelId(hashed, secondary);
      const offsetConditionalGeometry =
        VoxelLUT.getConditionalGeometryNodes(trueVoxelId);

      if (offsetConditionalGeometry) {
        const modelState = voxelIdToState[voxelId];
        const relationalModState = space.getRelationalState(hashed, secondary);

        for (let j = 0; j < offsetConditionalGeometry.length; j++) {
          const [condGeoId, requiredModelState, requiredRelationalModelState] =
            offsetConditionalGeometry[j];
          if (
            requiredModelState !== modelState ||
            !requiredRelationalModelState[relationalModState]
          ) {
            continue;
          }

          const geometries = geometryIndexLUT[condGeoId];
          for (let k = 0; k < geometries.length; k++) {
            const geoId = geometries[k];
            if (rulelessIndex[geoId]) continue;

            const cullingProcedure =
              cullingProcedures[cullingProceduresIndex[geoId]];
            const procType = cullingProcedure.type;

            if (procType === "transparent") {
              if (space.getTrueVoxelId(hashed, secondary) !== currentVoxelId)
                continue;
            }
            if (procType == "none") {
              continue;
            }

            if (
              faceCullIndex.getValue(geoId, directionIndex, trueFaceIndex) === 1
            ) {
              return false;
            }
          }
        }
      }
    }
  }

  return true;
}

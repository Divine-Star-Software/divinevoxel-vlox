import { VoxelLUT } from "../../../../../Voxels/Data/VoxelLUT";
import { GeomtryLUT } from "../../../../../Voxels/Data/GeomtryLUT";
import { VoxelRelativeCubeIndexPositionMap } from "../../../../../Voxels/Geomtry/VoxelRelativeCubeIndex";
import { VoxelModelBuilder } from "../../VoxelModelBuilder";

export function CullRulledFace(
  builder: VoxelModelBuilder,
  trueFaceIndex: number
) {
  const faceIndexes = GeomtryLUT.faceCullMap![trueFaceIndex];
  if (!faceIndexes) return true;

  for (let i = 0; i < faceIndexes.length; i++) {
    const directionIndex = faceIndexes[i];
    const p = VoxelRelativeCubeIndexPositionMap[directionIndex];
    const hashed = builder.space.getHash(
      builder.nVoxel,
      builder.position.x + p[0],
      builder.position.y + p[1],
      builder.position.z + p[2]
    );
    if (builder.space.foundHash[hashed] < 2) continue;

    const voxelStringId = VoxelLUT.voxelIds.getStringId(
      builder.space.trueVoxelCache[hashed]
    );

    const voxelId = builder.space.voxelCache[hashed];
    const reltionalVoxelId = builder.space.reltionalVoxelCache[hashed];
    const geomtryIndex = VoxelLUT.getGeomtryIndex(voxelId, reltionalVoxelId);
    const offsetBaseGometry = GeomtryLUT.geomtryIndex[geomtryIndex];
    if (offsetBaseGometry) {
      for (let i = 0; i < offsetBaseGometry.length; i++) {
        const geoId = offsetBaseGometry[i];
        if (GeomtryLUT.rulelessIndex[geoId]) continue;
        const cullingProcedure =
          GeomtryLUT.geomtryCullingProcedures[
            GeomtryLUT.geomtryCullingProceduresIndex[geoId]
          ];

        if (cullingProcedure.type == "transparent") {
          if (voxelStringId != builder.voxel.getStringId()) continue;
        } else {
          if (cullingProcedure.type != "default") continue;
        }

        if (
          GeomtryLUT.faceCullIndex.getValue(
            geoId,
            directionIndex,
            trueFaceIndex
          ) == 1
        ) {
          return false;
        }
      }
    }

    const trueVoxelId = builder.space.trueVoxelCache[hashed];
    const offsetConditonalGeometry =
      VoxelLUT.getConditionalGeomtryNodes(trueVoxelId);

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

        const geomerties = GeomtryLUT.geomtryIndex[geoId];
        for (let k = 0; k < geomerties.length; k++) {
          const geoId = geomerties[k];
          if (GeomtryLUT.rulelessIndex[geoId]) continue;
          const cullingProcedure =
            GeomtryLUT.geomtryCullingProcedures[
              GeomtryLUT.geomtryCullingProceduresIndex[geoId]
            ];
          if (cullingProcedure.type == "transparent") {
            if (voxelStringId != builder.voxel.getStringId()) continue;
          } else {
            if (cullingProcedure.type != "default") continue;
          }
          if (GeomtryLUT.rulelessIndex[geoId]) continue;
          if (
            GeomtryLUT.faceCullIndex.getValue(
              geoId,
              directionIndex,
              trueFaceIndex
            ) == 1
          )
            return false;
        }
      }
    }
  }

  return true;
}

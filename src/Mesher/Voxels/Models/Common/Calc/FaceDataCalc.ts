import type { VoxelModelBuilder } from "../../VoxelModelBuilder.js";
import { QuadVerticies } from "../../../../Geometry/Geometry.types.js";
import { VoxelFaces, VoxelFaceDirections } from "../../../../../Math/index.js";
import { GradientCheckSets } from "./CalcConstants.js";
import { VoxelLightData } from "../../../../../Voxels/Cursor/VoxelLightData.js";
const lightData = new VoxelLightData();
export default function calculateFaceData(
  face: VoxelFaces,
  builder: VoxelModelBuilder,
) {
  const x = builder.position.x;
  const y = builder.position.y;
  const z = builder.position.z;
  const vertexData = builder.lightData[face];
  const checkSet = GradientCheckSets[face];
  let startLight = 0;

  if (builder.voxel.isLightSource()) {
    startLight = builder.voxel.getLightSourceValue();
  } else {
    let hashed = builder.space.getHash(
      builder.nVoxel,
      x + VoxelFaceDirections[face][0],
      y + VoxelFaceDirections[face][1],
      z + VoxelFaceDirections[face][2],
    );
    startLight = builder.space.lightCache[hashed];
    if (startLight <= 0) {
      hashed = builder.space.getHash(builder.nVoxel, x, y, z);
      startLight = builder.space.lightCache[hashed];
    }
  }
  if (startLight < 0) startLight = 0;

  const startS = lightData.getS(startLight);
  const startR = lightData.getR(startLight);
  const startG = lightData.getG(startLight);
  const startB = lightData.getB(startLight);
  for (let vertex: QuadVerticies = <QuadVerticies>0; vertex < 4; vertex++) {
    vertexData[vertex] = startLight;
    let s = startS;
    let r = startR;
    let g = startG;
    let b = startB;
    for (let i = 0; i < 9; i += 3) {
      const hashed = builder.space.getHash(
        builder.nVoxel,
        checkSet[vertex][i] + x,
        checkSet[vertex][i + 1] + y,
        checkSet[vertex][i + 2] + z,
      );
      const nl = builder.space.lightCache[hashed];
      if (nl <= 0) continue;
      let ns = lightData.getS(nl);
      let nr = lightData.getR(nl);
      let ng = lightData.getG(nl);
      let nb = lightData.getB(nl);
      if (s < ns) s = ns;
      if (r < nr) r = nr;
      if (g < ng) g = ng;
      if (b < nb) b = nb;
    }
    vertexData[vertex] = lightData.createLightValue(s, r, g, b);
  }
}

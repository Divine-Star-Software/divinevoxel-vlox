import { VoxelGeometryBuilderCacheSpace } from "./Models/VoxelGeometryBuilderCacheSpace.js";
import { TemplateCursor } from "../../Templates/Cursor/TemplateCursor.js";
import { FullVoxelTemplate } from "../../Templates/Full/FullVoxelTemplate.js";
import { CompactTemplateMesh } from "./Base/CompactTemplateMesh.js";
import { RawVoxelData } from "../../Voxels/Types/Voxel.types.js";
import { CompactMeshData } from "../Types/index.js";
import { RenderedMaterials } from "./Models/RenderedMaterials.js";
import { VoxelLUT } from "../../Voxels/Data/VoxelLUT.js";
import { BuildVoxel } from "./Base/BuildVoxel.js";
const template = new FullVoxelTemplate(
  FullVoxelTemplate.CreateNew([3, 3, 3], 0xf)
);
const templateCursor = new TemplateCursor();
templateCursor.setTemplate(template);

const space = new VoxelGeometryBuilderCacheSpace({ x: 3, y: 3, z: 3 });
export function MeshVoxel(
  rawVoxelData: RawVoxelData
): [mesh: CompactMeshData, tranfers: any[]] | false {

  const index = template.getIndex(1, 1, 1);
  template.ids[index] = rawVoxelData[0];
  template.level[index] = rawVoxelData[2];
  template.secondary[index] = rawVoxelData[3];
  const voxel = templateCursor.getVoxel(1, 1, 1)!;
  if (!voxel.isRenderable()) return false;

  const builder =
    RenderedMaterials.meshers[VoxelLUT.materialMap[voxel.getVoxelId()]];


  builder.space = space;
  builder.bvhTool = null;
  builder.clear();
  space.start(0, 0, 0);

  builder.effects = {};
  builder.origin.x = -0.5;
  builder.origin.y = -0.5;
  builder.origin.z = -0.5;
  builder.position.x = 1;
  builder.position.y = 1;
  builder.position.z = 1;

  builder.voxel = voxel;
  builder.nVoxel = templateCursor;

  BuildVoxel(builder);

  const transfers: any[] = [];
  const compacted = CompactTemplateMesh([builder], transfers);
  builder.clear();

  return [compacted, transfers];
}

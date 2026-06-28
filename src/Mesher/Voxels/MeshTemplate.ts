import { VoxelGeometryBuilderCacheSpace } from "./Models/VoxelGeometryBuilderCacheSpace.js";
import { TemplateCursor } from "../../Templates/Cursor/TemplateCursor.js";
import { FullVoxelTemplate } from "../../Templates/Full/FullVoxelTemplate.js";
import { CompactTemplateMesh } from "./Base/CompactTemplateMesh.js";
import { CompactMeshData } from "../Types/index.js";
import { FullVoxelTemplateData } from "../../Templates/Full/FullVoxelTemplate.types.js";
import { TemplateVoxelCursor } from "../../Templates/Cursor/TemplateVoxelCursor.js";
import { Vector3Like } from "@amodx/math";
import { RenderedMaterials } from "./Models/RenderedMaterials.js";
import { VoxelLightData } from "../../Voxels/Cursor/VoxelLightData.js";
import { VoxelModelBuilder } from "./Models/VoxelModelBuilder.js";
import { BuildVoxel, BuildVoxelBase } from "./Base/BuildVoxel.js";
import { VoxelLUT } from "../../Voxels/Data/VoxelLUT.js";
const templateCursor = new TemplateCursor();
const padding = Vector3Like.Create(5, 5, 5);
const lightData = new VoxelLightData();

export function MeshTemplate(
  fullVoxelData: FullVoxelTemplateData,
  baseLightValue = lightData.setS(0xf, 0),
): [mesh: CompactMeshData, tranfers: any[]] | false {
  const template = new FullVoxelTemplate(fullVoxelData);
  templateCursor.setTemplate(template);
  const space = new VoxelGeometryBuilderCacheSpace({
    x: template.bounds.size.x + padding.x,
    y: template.bounds.size.y + padding.y,
    z: template.bounds.size.z + padding.z,
  });
  space.start(-2, -2, -2);

  const effects = {};
  for (let i = 0; i < RenderedMaterials.meshers.length; i++) {
    const mesher = RenderedMaterials.meshers[i];
    mesher.space = space;
    mesher.effects = effects;
  }

  const oldLight = template.light.slice();
  template.light.fill(baseLightValue);
  const size = template.bounds.size;

  const origin = Vector3Like.Create();
  for (let x = 0; x < size.x; x++) {
    for (let y = 0; y < size.y; y++) {
      for (let z = 0; z < size.z; z++) {
        origin.x = x;
        origin.y = y;
        origin.z = z;
        const voxel = templateCursor.getVoxel(x, y, z)!;
        BuildVoxel(x, y, z, voxel, templateCursor, origin);
      }
    }
  }

  const meshed: VoxelModelBuilder[] = [];
  for (let i = 0; i < RenderedMaterials.meshers.length; i++) {
    const mesher = RenderedMaterials.meshers[i];
    if (!mesher.mesh.vertexCount) {
      mesher.clear();
      continue;
    }
    meshed.push(mesher);
  }
  const transfers: any[] = [];

  const compacted = CompactTemplateMesh(meshed, transfers);

  for (let i = 0; i < meshed.length; i++) {
    meshed[i].clear();
  }

  template.light.set(oldLight);

  return [compacted, transfers];
}

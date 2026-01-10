import { VoxelGeometryBuilderCacheSpace } from "./Models/VoxelGeometryBuilderCacheSpace.js";
import { TemplateCursor } from "../../Templates/Cursor/TemplateCursor.js";
import { FullVoxelTemplate } from "../../Templates/Full/FullVoxelTemplate.js";
import { CompactTemplateMesh } from "./Base/CompactTemplateMesh.js";
import { VoxelModelConstructorRegister } from "./Models/VoxelModelConstructorRegister.js";
import { CompactMeshData } from "../Types/index.js";
import { FullVoxelTemplateData } from "../../Templates/Full/FullVoxelTemplate.types.js";
import { TemplateVoxelCursor } from "../../Templates/Cursor/TemplateVoxelCursor.js";
import { Vector3Like } from "@amodx/math";
import { RenderedMaterials } from "./Models/RenderedMaterials.js";
import { VoxelLightData } from "../../Voxels/Cursor/VoxelLightData.js";
import { VoxelModelBuilder } from "./Models/VoxelModelBuilder.js";
const templateCursor = new TemplateCursor();
const padding = Vector3Like.Create(5, 5, 5);
const lightData = new VoxelLightData();
function meshVoxel(
  x: number,
  y: number,
  z: number,
  voxel: TemplateVoxelCursor,
  templateCursor: TemplateCursor
): boolean {
  if (voxel.isAir() || !voxel.isRenderable()) return false;

  let added = false;
  const constructor =
    VoxelModelConstructorRegister.constructorsPaltte[voxel.getVoxelId()];
  const builder = constructor.builder;
  builder.origin.x = x;
  builder.origin.y = y;
  builder.origin.z = z;
  builder.position.x = x;
  builder.position.y = y;
  builder.position.z = z;
  builder.voxel = voxel;
  builder.nVoxel = templateCursor;

  builder.startConstruction();
  added = constructor.process();
  builder.endConstruction();
  return added;
}

export function MeshTemplate(
  fullVoxelData: FullVoxelTemplateData,
  baseLightValue = lightData.setS(0xf, 0)
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

  for (let x = 0; x < size.x; x++) {
    for (let y = 0; y < size.y; y++) {
      for (let z = 0; z < size.z; z++) {
        const voxel = templateCursor.getVoxel(x, y, z)!;
        meshVoxel(x, y, z, voxel, templateCursor);
        if (voxel.hasSecondaryVoxel()) {
          voxel.setSecondary(true);
          meshVoxel(x, y, z, voxel, templateCursor);
          voxel.setSecondary(false);
        }
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

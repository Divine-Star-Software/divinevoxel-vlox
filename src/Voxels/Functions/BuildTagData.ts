import { VoxelTagsRegister } from "../Data/VoxelTagsRegister";
import { VoxelData } from "../Types/Voxel.types";
import { VoxelMaterialData } from "../Types/VoxelMaterial.types";
import { VoxelSubstanceData } from "../Types/VoxelSubstances.types";
import { VoxelSubstanceTags, VoxelTags } from "../Data/VoxelTag.types";
import { CompiledvVxelTags } from "../Types/VoxelModelCompiledData.types";
import { VoxelLogicData } from "../Logic/VoxelLogic.types";
import { VoxelPropertiesRegister } from "../Data/VoxelPropertiesRegister";
import { VoxelPlacingStrategyRegister } from "../../Voxels/Interaction/Placing/VoxelPlacingStrategyRegister";
import { VoxelLUT } from "../../Voxels/Data/VoxelLUT";
import { VoxelModelData } from "../../Voxels/Models/VoxelModel.types";

export type BuildTagDataProps = {
  voxels: VoxelData[];
  models: VoxelModelData[];
  voxelsOverrides?: Record<string, (value: any) => any>;
  substances: VoxelSubstanceData[];
  substancesOverrides?: Record<string, (value: any) => any>;
  materials: VoxelMaterialData[];
  materialsOverrides?: Record<string, (value: any) => any>;
};
export function BuildTagAndPaletteData(
  props: BuildTagDataProps
): CompiledvVxelTags {
  const logic: Record<string, VoxelLogicData[]> = {};
  const models = new Map<string, VoxelModelData>(
    props.models.map((_) => [_.id, _])
  );
  for (const voxel of props.voxels) {
    const tags: VoxelTags = {} as any;

    const voxelId = VoxelLUT.voxelIds.getNumberId(voxel.id);
    VoxelPropertiesRegister.VoxelProperties[voxelId] = voxel.properties;
    if (voxel.properties["dve_model_data"]) {
      tags["dve_model_id"] = voxel.properties["dve_model_data"].id;
      const model = models.get(tags["dve_model_id"]);
      if (model) {
        if (model?.properties) {
          for (const tagId in model.properties) {
            voxel.properties[tagId] = (model.properties as any)[tagId];
          }
        }
      }
    }

    if (voxel.properties["dve_placing_strategy"]) {
      VoxelPlacingStrategyRegister.register(
        voxel.id,
        voxel.properties["dve_placing_strategy"]
      );
    }

    if (voxel.properties["dve_logic_data"]) {
      logic[voxel.id] = voxel.properties["dve_logic_data"];
    }

    for (const tag of VoxelTagsRegister.IncludedVoxelTags) {
      if (voxel.properties[tag] === undefined) {
        (tags as any)[tag] = VoxelTagsRegister.VoxelTagDefaults[tag] ?? false;

        continue;
      }

      if (props?.voxelsOverrides?.[tag]) {
        (tags as any)[tag] = props.voxelsOverrides[tag](voxel.properties[tag]);
        continue;
      }
      (tags as any)[tag] = voxel.properties[tag];
    }
    VoxelTagsRegister.VoxelTags[voxelId] = tags;
  }

  for (const substance of props.substances) {
    const tags: VoxelSubstanceTags = {} as any;
    const substanceId = VoxelLUT.substance.getNumberId(substance.id);
    for (const tag of VoxelTagsRegister.IncludedSubstnacesTags) {
      if (substance.properties[tag] === undefined) {
        (tags as any)[tag] =
          VoxelTagsRegister.SubstanceTagDefaults[tag] || false;
        continue;
      }

      if (props?.substancesOverrides?.[tag]) {
        (tags as any)[tag] = props.substancesOverrides[tag](
          substance.properties[tag]
        );
        continue;
      }
      (tags as any)[tag] = substance.properties[tag];
    }
    VoxelTagsRegister.SubstanceTags[substanceId] = tags;
  }

  return {
    logic,
    tags: VoxelTagsRegister.VoxelTags,
    substanceTags: VoxelTagsRegister.SubstanceTags,
  };
}

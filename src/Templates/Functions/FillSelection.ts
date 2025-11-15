import { IVoxelSelection } from "../Selection/VoxelSelection";
import { FullVoxelTemplate } from "../Full/FullVoxelTemplate";
import { PaintVoxelData } from "../../Voxels/Types/PaintVoxelData";

export function FillSelection(
  voxel: PaintVoxelData,
  selection: IVoxelSelection
) {
  const size = selection.bounds.size;
  const template = new FullVoxelTemplate(
    FullVoxelTemplate.CreateNew([size.x, size.y, size.z])
  );
  const raw = PaintVoxelData.ToRaw(voxel);
  for (let x = selection.origin.x; x < selection.origin.x + size.x; x++) {
    for (let y = selection.origin.y; y < selection.origin.y + size.y; y++) {
      for (let z = selection.origin.z; z < selection.origin.z + size.z; z++) {
        if (selection.isSelected(x, y, z)) {
          const index = template.getIndex(
            x - selection.origin.x,
            y - selection.origin.y,
            z - selection.origin.z
          );
          template.ids[index] = raw[0];
          template.level[index] = raw[2];
          template.secondary[index] = raw[3];
        }
      }
    }
  }
  return template;
}

import { IVoxelSelection } from "../Selection/VoxelSelection";
import { DataCursorInterface } from "../../Voxels/Cursor/DataCursor.interface";
import { FullVoxelTemplate } from "../Full/FullVoxelTemplate";
import { Vector3Like } from "@amodx/math";

export function ExtrudeSelection(
  cursor: DataCursorInterface,
  selection: IVoxelSelection,
  normal: Vector3Like
) {
  const size = selection.bounds.size;
  const template = new FullVoxelTemplate(
    FullVoxelTemplate.CreateNew([size.x, size.y, size.z])
  );

  for (let x = selection.origin.x; x < selection.origin.x + size.x; x++) {
    for (let y = selection.origin.y; y < selection.origin.y + size.y; y++) {
      for (let z = selection.origin.z; z < selection.origin.z + size.z; z++) {
        if (selection.isSelected(x, y, z)) {
          let nx = x;
          let ny = y;
          let nz = z;
          const index = template.getIndex(
            x - selection.origin.x,
            y - selection.origin.y,
            z - selection.origin.z
          );
          while (true) {
            nx -= normal.x;
            ny -= normal.y;
            nz -= normal.z;

            if (!selection.isSelected(nx, ny, nz)) {
              const voxel = cursor.getVoxel(nx, ny, nz)!;

              if (!voxel || voxel.isAir()) break;
              template.ids[index] = voxel.ids[voxel._index];
              template.level[index] = voxel.level[voxel._index];
              template.secondary[index] = voxel.secondary[voxel._index];
              break;
            }

            if (x < selection.origin.x || x >= selection.origin.x + size.x)
              continue;
            if (y < selection.origin.y || y >= selection.origin.y + size.y)
              continue;
            if (z < selection.origin.z || z >= selection.origin.z + size.z)
              continue;

            const nIndex = template.getIndex(
              nx - selection.origin.x,
              ny - selection.origin.y,
              nz - selection.origin.z
            );
            if (!template.isAir(nIndex)) {
              template.ids[index] = template.ids[nIndex];
              template.level[index] = template.level[nIndex];
              template.secondary[index] = template.secondary[nIndex];
            }
          }
        }
      }
    }
  }
  return template;
}

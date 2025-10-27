import { Flat3DIndex, Vec3Array, Vector3Axes } from "@amodx/math";
import { FullVoxelTemplate } from "../../Templates/Full/FullVoxelTemplate";

const flipArray = (
  [sizeX, sizeY, sizeZ]: Vec3Array,
  array: ArrayLike<number>,
  axes: Vector3Axes,
  index: Flat3DIndex
) => {
  const newArray = new Array(array.length);

  for (let x = 0; x < sizeX; x++) {
    for (let y = 0; y < sizeY; y++) {
      for (let z = 0; z < sizeZ; z++) {
        const oldIndex = index.getIndexXYZ(x, y, z);

        let newCoords: Vec3Array = [x, y, z];

        if (axes === "x") {
          newCoords[0] = sizeX - 1 - x;
        } else if (axes === "y") {
          newCoords[1] = sizeY - 1 - y;
        } else if (axes === "z") {
          newCoords[2] = sizeZ - 1 - z;
        }

        const newIndexFlat = index.getIndexXYZ(...newCoords);
        newArray[newIndexFlat] = array[oldIndex];
      }
    }
  }

  for (let i = 0; i < array.length; i++) {
    (array as any)[i] = newArray[i];
  }
};

export default function FlipTemplate(
  template: FullVoxelTemplate,
  axes: Vector3Axes
) {
  const { x: sizeX, y: sizeY, z: sizeZ } = template.bounds.size;
  const index = Flat3DIndex.GetXZYOrder();
  index.setBounds(sizeX, sizeY, sizeZ);

  if (typeof template.ids === "object") {
    const ids: ArrayLike<number> = template.ids;
    flipArray([sizeX, sizeY, sizeZ], ids, axes, index);
  }
  if (typeof template.level === "object") {
    const level: ArrayLike<number> = template.level;
    flipArray([sizeX, sizeY, sizeZ], level, axes, index);
  }

  if (typeof template.secondary === "object") {
    const secondary: ArrayLike<number> = template.secondary;
    flipArray([sizeX, sizeY, sizeZ], secondary, axes, index);
  }
}

import { Flat3DIndex, Vec3Array, Vector3Like } from "@amodx/math";
import { IVoxelSelection, IVoxelSelectionData } from "./VoxelSelection";
import { CardinalNeighbors2D } from "../../Math/CardinalNeighbors";
import { DataCursorInterface } from "../../Voxels/Cursor/DataCursor.interface";
import {
  getBitArrayIndex,
  getBitAtomicArrayIndex,
  setBitArrayIndex,
} from "../../Util/Binary/BinaryArrays";
import { PaintVoxelData } from "../../Voxels/Types/PaintVoxelData";
import { FullVoxelTemplate } from "../Full/FullVoxelTemplate";
import { BoundingBox } from "@amodx/math/Geometry/Bounds/BoundingBox";

export interface VoxelSurfaceSelectionData
  extends IVoxelSelectionData<"surface"> {
  normal: Vector3Like;
  bitIndex: Uint8Array;
}

export class VoxelSurfaceSelection implements IVoxelSelection<"surface"> {
  origin = Vector3Like.Create();
  normal = Vector3Like.Create();
  bitIndex: Uint8Array;
  index = Flat3DIndex.GetXZYOrder();
  bounds = new BoundingBox();

  isSelected(x: number, y: number, z: number): boolean {
    if (!this.bounds.intersectsXYZ(x + 0.5, y + 0.5, z + 0.5)) return false;
    return (
      getBitArrayIndex(
        this.bitIndex,
        this.index.getIndexXYZ(
          x - this.origin.x,
          y - this.origin.y,
          z - this.origin.z
        )
      ) === 1
    );
  }

  reConstruct(
    cursor: DataCursorInterface,
    position: Vector3Like,
    normal: Vector3Like,
    extrusion: number,
    maxSize = 1000
  ) {
    this.normal.x = normal.x;
    this.normal.y = normal.y;
    this.normal.z = normal.z;

    let axis = "x";
    if (normal.x) axis = "x";
    if (normal.y) axis = "y";
    if (normal.z) axis = "z";

    const min = Vector3Like.Create(Infinity, Infinity, Infinity);
    const max = Vector3Like.Create(-Infinity, -Infinity, -Infinity);

    // 1) BFS to collect the *surface-adjacent* air layer (offset 1 in +normal)
    const queue: number[] = [
      position.x + normal.x,
      position.y + normal.y,
      position.z + normal.z,
    ];
    let size = 0;
    const visited = new Set<string>();

    while (queue.length) {
      if (size > maxSize) break;
      const x = queue.shift()!;
      const y = queue.shift()!;
      const z = queue.shift()!;

      const key = `${x} ${y} ${z}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (x < min.x) min.x = x;
      if (y < min.y) min.y = y;
      if (z < min.z) min.z = z;
      if (x > max.x) max.x = x;
      if (y > max.y) max.y = y;
      if (z > max.z) max.z = z;

      // Expand only in the 2D tangent plane to the face normal.
      for (let i = 0; i < CardinalNeighbors2D.length; i++) {
        const n = CardinalNeighbors2D[i];

        let nx = x,
          ny = y,
          nz = z;
        if (axis == "x") {
          ny += n[0];
          nz += n[1];
        }
        if (axis == "y") {
          nx += n[0];
          nz += n[1];
        }
        if (axis == "z") {
          nx += n[0];
          ny += n[1];
        }

        const voxel = cursor.getVoxel(nx, ny, nz);
        if (!voxel || !voxel.isAir()) continue;

        // Must be "resting" on a solid (the face we clicked)
        const bottomVoxel = cursor.getVoxel(
          nx - normal.x,
          ny - normal.y,
          nz - normal.z
        );
        if (!bottomVoxel || bottomVoxel.isAir()) continue;

        queue.push(nx, ny, nz);
      }
      size++;
    }

    if (min.x == Infinity || min.y == Infinity || min.z == Infinity)
      return false;
    if (max.x == -Infinity || max.y == -Infinity || max.z == -Infinity)
      return false;

    // 2) Extrude outward along +normal for 'extrusion' layers.
    //    We grow layer-by-layer; each new layer must be air and contiguous to the previous layer stack.
    if (extrusion > 0) {
      // Collect the initial (surface-adjacent) layer as our starting front.
      let front: Array<{ x: number; y: number; z: number }> = [];
      for (const key of visited) {
        const [sx, sy, sz] = key.split(" ").map(Number);
        front.push({ x: sx, y: sy, z: sz });
      }

      for (let d = 1; d <= extrusion; d++) {
        const nextFront: Array<{ x: number; y: number; z: number }> = [];
        for (const p of front) {
          const tx = p.x + normal.x;
          const ty = p.y + normal.y;
          const tz = p.z + normal.z;

          const tKey = `${tx} ${ty} ${tz}`;
          if (visited.has(tKey)) continue; // already added by another path

          const world = cursor.getVoxel(tx, ty, tz);
          if (!world || !world.isAir()) continue; // stop extrusion if we hit solid

          visited.add(tKey);
          nextFront.push({ x: tx, y: ty, z: tz });

          if (tx < min.x) min.x = tx;
          if (ty < min.y) min.y = ty;
          if (tz < min.z) min.z = tz;
          if (tx > max.x) max.x = tx;
          if (ty > max.y) max.y = ty;
          if (tz > max.z) max.z = tz;
        }
        if (nextFront.length === 0) break; // nothing more to grow
        front = nextFront;
      }
    }

    // 3) Build compact bit mask over the final bounds.
    const sizeX = max.x - min.x + 1;
    const sizeY = max.y - min.y + 1;
    const sizeZ = max.z - min.z + 1;

    this.index.setBounds(sizeX, sizeY, sizeZ);
    this.bitIndex = new Uint8Array(Math.ceil((sizeX * sizeY * sizeZ) / 8));

    for (let x = min.x; x < min.x + sizeX; x++) {
      for (let y = min.y; y < min.y + sizeY; y++) {
        for (let z = min.z; z < min.z + sizeZ; z++) {
          const key = `${x} ${y} ${z}`;
          if (!visited.has(key)) continue;
          setBitArrayIndex(
            this.bitIndex,
            this.index.getIndexXYZ(x - min.x, y - min.y, z - min.z),
            1
          );
        }
      }
    }

    this.origin.x = min.x;
    this.origin.y = min.y;
    this.origin.z = min.z;

    this.bounds.setMinMax(this.origin, {
      x: this.origin.x + sizeX,
      y: this.origin.y + sizeY,
      z: this.origin.z + sizeZ,
    });

    return true;
  }

  clone() {
    const newSelection = new VoxelSurfaceSelection();
    Vector3Like.Copy(newSelection.origin, this.origin);
    newSelection.bounds.setMinMax(this.bounds.min, this.bounds.max);
    newSelection.bitIndex = this.bitIndex.slice();
    newSelection.index.setBounds(...this.index.getBounds());
    newSelection.bounds.setMinMax(this.bounds.min, this.bounds.max);
    return newSelection;
  }

  toTemplate(voxel: PaintVoxelData): FullVoxelTemplate {
    const size = this.bounds.size;
    const template = new FullVoxelTemplate(
      FullVoxelTemplate.CreateNew([size.x, size.y, size.z])
    );

    const raw = PaintVoxelData.ToRaw(voxel);
    for (let x = this.origin.x; x < this.origin.x + size.x; x++) {
      for (let y = this.origin.y; y < this.origin.y + size.y; y++) {
        for (let z = this.origin.z; z < this.origin.z + size.z; z++) {
          if (this.isSelected(x, y, z)) {
            const index = template.getIndex(
              x - this.origin.x,
              y - this.origin.y,
              z - this.origin.z
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

  toJSON(): VoxelSurfaceSelectionData {
    return {
      type: "surface",
      origin: { ...this.origin },
      normal: { ...this.normal },
      bitIndex: this.bitIndex.slice(),
      bounds: { ...this.bounds.size },
    };
  }

  fromJSON(data: VoxelSurfaceSelectionData) {
    this.origin.x = data.origin.x;
    this.origin.y = data.origin.y;
    this.origin.z = data.origin.z;

    this.normal.x = data.normal.x;
    this.normal.y = data.normal.y;
    this.normal.z = data.normal.z;

    this.bitIndex = data.bitIndex;

    this.bounds.setMinMax(this.origin, {
      x: this.origin.x + data.bounds.x,
      y: this.origin.y + data.bounds.y,
      z: this.origin.z + data.bounds.z,
    });

    this.index.setBounds(data.bounds.x, data.bounds.y, data.bounds.z);
  }
}

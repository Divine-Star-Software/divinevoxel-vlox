import { Flat3DIndex, Vec3Array, Vector3Like } from "@amodx/math";
import { ArchivedVoxelTemplateData } from "./ArchivedVoxelTemplate.types";
import type { RawVoxelData } from "../../Voxels/Types/Voxel.types";
import { NumberPalette } from "../../Util/NumberPalette";
import { VoxelLUT } from "../../Voxels/Data/VoxelLUT";
import { VoxelTagsRegister } from "../../Voxels/Data/VoxelTagsRegister";
import { IVoxelTemplate } from "../../Templates/VoxelTemplates.types";
import {
  BinaryBuffer,
  BinaryBufferFormat,
} from "../../Util/BinaryBuffer/index";
import { VoxelPaletteArchiveReader } from "../../Voxels/Archive/VoxelPaletteArchiveReader";
import { BoundingBox } from "@amodx/math/Geomtry/Bounds/BoundingBox";

type TemplateCursor = { position: Vec3Array; raw: RawVoxelData };
const point = Vector3Like.Create();
export class ArchivedVoxelTemplate implements IVoxelTemplate {
  index = Flat3DIndex.GetXZYOrder();
  bounds: BoundingBox;
  ids: BinaryBuffer;
  level: BinaryBuffer;
  secondary: BinaryBuffer;

  voxelPalette: VoxelPaletteArchiveReader;

  levelPalette: NumberPalette;
  secondaryPalette: NumberPalette;
  private data: ArchivedVoxelTemplateData;
  constructor(data: ArchivedVoxelTemplateData) {
    this.fromJSON(data);
  }

  inBounds(x: number, y: number, z: number): boolean {
    point.x = x + 0.5;
    point.y = y + 0.5;
    point.z = z + 0.5;
    return this.bounds.intersectsPoint(point);
  }

  isAir(index: number) {
    return this.getId(index) === 0;
  }

  isIncluded(index: number) {
    return true;
  }

  getIndex(x: number, y: number, z: number) {
    return this.index.getIndexXYZ(x, y, z);
  }

  getId(index: number) {
    return VoxelLUT.getVoxelIdFromString(
      ...this.voxelPalette.getVoxelData(this.ids.getValue(index))
    );
  }

  getLevel(index: number) {
    return this.levelPalette.getValue(this.level.getValue(index));
  }

  getLight(index: number): number {
    return 0;
  }

  getSecondary(index: number) {
    const id = this.getId(index);
    const trueId = VoxelLUT.voxels[id][0];
    if (VoxelTagsRegister.VoxelTags[trueId]["dve_can_have_secondary"]) {
      return VoxelLUT.getVoxelIdFromString(
        ...this.voxelPalette.getVoxelData(
          this.secondaryPalette.getValue(this.secondary.getValue(index))
        )
      );
    }

    return 0;
  }

  *traverse(
    curosr: TemplateCursor = {
      position: [0, 0, 0],
      raw: [0, 0, 0, 0],
    }
  ): Generator<TemplateCursor> {
    for (let x = 0; x < this.bounds.size.x; x++) {
      for (let y = 0; y < this.bounds.size.y; y++) {
        for (let z = 0; z < this.bounds.size.z; z++) {
          curosr.position[0] = x;
          curosr.position[1] = y;
          curosr.position[2] = z;
          const vindex = this.index.getIndexXYZ(x, y, z);
          curosr.raw[0] = this.getId(vindex);
          curosr.raw[1] = 0;
          curosr.raw[2] = this.getLevel(vindex);
          curosr.raw[3] = this.getSecondary(vindex);
          if (curosr.raw[0] < 1 && curosr.raw[3] < 1) continue;
          yield curosr;
        }
      }
    }
  }

  clone() {
    const newTemplate = new ArchivedVoxelTemplate(
      structuredClone(this.toJSON())
    );
    return newTemplate;
  }

  getRaw(index: number, rawRef: RawVoxelData = [0, 0, 0, 0]): RawVoxelData {
    rawRef[0] = this.getId(index);
    rawRef[1] = this.getLight(index);
    rawRef[2] = this.getLevel(index);
    rawRef[3] = this.getSecondary(index);
    return rawRef;
  }

  toJSON(): ArchivedVoxelTemplateData {
    return this.data;
  }

  fromJSON(data: ArchivedVoxelTemplateData): void {
    this.data = data;
    this.bounds = new BoundingBox();
    this.bounds.setSize(data.bounds);
    this.index.setBounds(data.bounds.x, data.bounds.y, data.bounds.z);

    this.voxelPalette = new VoxelPaletteArchiveReader(data.palettes);
    if (data.palettes.level) {
      this.levelPalette = new NumberPalette(
        BinaryBuffer.ToTypedArray(data.palettes.level)
      );
    } else {
      this.levelPalette = new NumberPalette([0]);
    }

    if (data.palettes.secondary) {
      this.secondaryPalette = new NumberPalette(
        BinaryBuffer.ToTypedArray(data.palettes.secondary)
      );
    } else {
      this.secondaryPalette = new NumberPalette([0]);
    }

    const volume = this.index.size;
    this.ids = data.buffers.ids
      ? new BinaryBuffer(data.buffers.ids)
      : new BinaryBuffer(
          BinaryBuffer.Create({
            format: BinaryBufferFormat.Uint16,
            byteLength: volume,
            buffer: 0,
          })
        );
    this.level = data.buffers.level
      ? new BinaryBuffer(data.buffers.level)
      : new BinaryBuffer(
          BinaryBuffer.Create({
            format: BinaryBufferFormat.Uint8,
            byteLength: volume,
            buffer: 0,
          })
        );
    this.secondary = data.buffers.secondary
      ? new BinaryBuffer(data.buffers.secondary)
      : new BinaryBuffer(
          BinaryBuffer.Create({
            format: BinaryBufferFormat.Uint16,
            byteLength: volume,
            buffer: 0,
          })
        );
  }
}

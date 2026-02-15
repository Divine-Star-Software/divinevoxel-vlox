import { Flat3DIndex, Vector3Like } from "@amodx/math";
import { ArchivedVoxelTemplate } from "../ArchivedVoxelTemplate";
import { NumberPalette } from "../../../Util/NumberPalette";
import { ArchivedVoxelTemplateData } from "../ArchivedVoxelTemplate.types";
import {
  BinaryBuffer,
  BinaryBufferFormat,
} from "../../../Util/BinaryBuffer/index";
import { VoxelArchivePalette } from "../../../Voxels/Archive/VoxelPaletteArechive";
import { VoxelTagsRegister } from "../../../Voxels/Data/VoxelTagsRegister";
import { VoxelLUT } from "../../../Voxels/Data/VoxelLUT";
import { EngineSettings } from "../../../Settings/EngineSettings";
import { FullVoxelTemplateData } from "../../Full/FullVoxelTemplate.types";

/**
 * Converts a FullVoxelTemplateData into an ArchivedVoxelTemplate.
 */
export default function CreateArchivedTemplateFromFull(
  fullData: FullVoxelTemplateData,
): ArchivedVoxelTemplate {
 const index = Flat3DIndex.GetXZYOrder();
  index.setBounds(fullData.bounds.x, fullData.bounds.y, fullData.bounds.z);

  const levelPalette = new NumberPalette();
  const voxelPalette = new VoxelArchivePalette();
  const secondaryPalette = new NumberPalette();

  const ids = new Uint16Array(index.size);
  const levels = new Uint8Array(index.size);
  const secondary = new Uint16Array(index.size);

  let idsAllTheSame = true;
  let levelAllTheSame = true;
  let secondaryAllTheSame = true;

  let firstId = -1;
  let firstLevel = -1;
  let firstSecondary = -1;
  let hasAnyVoxels = false;

  for (let i = 0; i < index.size; i++) {
    const rawId = fullData.ids[i];
    const voxelId = voxelPalette.register(rawId);

    const level = fullData.level[i];
    const levelId = !levelPalette.isRegistered(level)
      ? levelPalette.register(level)
      : levelPalette.getId(level);

    let voxelSecondary = 0;
    const rawSecondary = fullData.secondary[i];
    if (
      rawSecondary !== 0 &&
      VoxelTagsRegister.VoxelTags[VoxelLUT.voxelIdToTrueId[rawId]][
        "dve_can_have_secondary"
      ]
    ) {
      voxelSecondary = voxelPalette.register(rawSecondary);
      if (!secondaryPalette.isRegistered(voxelSecondary))
        secondaryPalette.register(voxelSecondary);
    }

    if (!hasAnyVoxels) hasAnyVoxels = true;
    if (firstId === -1) firstId = voxelId;
    if (firstLevel === -1) firstLevel = levelId;
    if (firstSecondary === -1) firstSecondary = voxelSecondary;

    ids[i] = voxelId;
    levels[i] = levelId;
    secondary[i] = voxelSecondary;

    if (firstId !== voxelId) idsAllTheSame = false;
    if (firstLevel !== levelId) levelAllTheSame = false;
    if (firstSecondary !== voxelSecondary) secondaryAllTheSame = false;
  }

  const buffers: ArchivedVoxelTemplateData["buffers"] = <any>{};

  const idsPaletted = voxelPalette.size < 0xffff;
  const levelPaletted = levelPalette.size < 0xff;
  const secondaryPaletted = secondaryPalette.size < 0xffff;

  // ids
  if (idsAllTheSame) {
    if (hasAnyVoxels) {
      buffers.ids = BinaryBuffer.Create({
        format: BinaryBufferFormat.Uint16,
        byteLength: ids.length,
        buffer: ids[0],
      });
    }
  } else if (idsPaletted) {
    const type = BinaryBuffer.DetermineSubByteArray(voxelPalette.size)!;
    buffers.ids = BinaryBuffer.Create({
      buffer: BinaryBuffer.Convert(ids, BinaryBufferFormat.Uint16, type).buffer,
      format: type,
      byteLength: ids.length,
    });
  } else {
    buffers.ids = BinaryBuffer.Create({
      buffer: ids.buffer,
      format: BinaryBufferFormat.Uint16,
      byteLength: ids.length,
    });
  }

  // level
  if (levelAllTheSame) {
    if (hasAnyVoxels) {
      buffers.level = BinaryBuffer.Create({
        format: BinaryBufferFormat.Uint8,
        byteLength: levels.length,
        buffer: levels[0],
      });
    }
  } else if (levelPaletted) {
    const type = BinaryBuffer.DetermineSubByteArray(levelPalette.size)!;
    buffers.level = BinaryBuffer.Create({
      buffer: BinaryBuffer.Convert(levels, BinaryBufferFormat.Uint8, type)
        .buffer,
      format: type,
    });
  } else {
    buffers.level = BinaryBuffer.Create({
      buffer: levels.buffer,
      format: BinaryBufferFormat.Uint8,
    });
  }

  // secondary
  if (secondaryAllTheSame) {
    if (hasAnyVoxels) {
      buffers.secondary = BinaryBuffer.Create({
        format: BinaryBufferFormat.Uint16,
        byteLength: secondary.length,
        buffer: secondary[0],
      });
    }
  } else if (secondaryPaletted) {
    const type = BinaryBuffer.DetermineSubByteArray(voxelPalette.size)!;
    buffers.secondary = BinaryBuffer.Create({
      buffer: BinaryBuffer.Convert(secondary, BinaryBufferFormat.Uint16, type)
        .buffer,
      format: type,
    });
  } else {
    buffers.secondary = BinaryBuffer.Create({
      buffer: secondary.buffer,
      format: BinaryBufferFormat.Uint16,
    });
  }

  const palettes: ArchivedVoxelTemplateData["palettes"] = {
    ...voxelPalette.toJSON(),
  };
  if (
    levelPalette.size > 0 &&
    !(levelPalette.size === 1 && levelPalette._palette[0] === 0)
  ) {
    palettes.level = BinaryBuffer.Create({
      format: BinaryBufferFormat.Uint8,
      byteLength: levelPalette._palette.length,
      buffer: Uint8Array.from(levelPalette._palette).buffer,
    });
  }
  if (
    secondaryPalette.size > 0 &&
    !(secondaryPalette.size === 1 && secondaryPalette._palette[0] === 0)
  ) {
    palettes.secondary = BinaryBuffer.Create({
      format: BinaryBufferFormat.Uint16,
      byteLength: secondaryPalette._palette.length,
      buffer: Uint16Array.from(secondaryPalette._palette).buffer,
    });
  }

  const data: ArchivedVoxelTemplateData = {
    type: "archived",
    engineVersion: EngineSettings.version,
    formatVersion: "",
    dataKey: {
      voxelPalette: VoxelArchivePalette.GetVoxelPaletteDataKey(),
      arrayOrders: {
        id: "YXZ",
        level: "YXZ",
        secondary: "YXZ",
      },
    },
    bounds: Vector3Like.Create(
      fullData.bounds.x,
      fullData.bounds.y,
      fullData.bounds.z
    ),
    palettes,
    buffers,
  };

  return new ArchivedVoxelTemplate(data);
}

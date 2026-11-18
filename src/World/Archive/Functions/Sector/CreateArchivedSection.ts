import { ArchivedSectionData } from "../../Types/index";
import {
  BinaryBuffer,
  BinaryBufferFormat,
} from "@amodx/binary/Buffer";
import { getLightBuffer, lightSegments } from "../Shared/LightSegments";
import { ProcessedSection, SectorPalette } from "../../Classes/ArchiveClasses";

export function CreateArchivedSection(
  archiveSection: ProcessedSection,
  sectorPalettes: SectorPalette
): ArchivedSectionData {
  const palettes: ArchivedSectionData["palettes"] = {};
  if (archiveSection.voxels.remapped) {
    palettes.id = BinaryBuffer.Create({
      format: BinaryBufferFormat.Uint16,
      buffer: Uint16Array.from(archiveSection.palettes.voxels._palette).buffer,
    });
  }

  if (archiveSection.level.remapped) {
    palettes.level = BinaryBuffer.Create({
      format: BinaryBufferFormat.Uint8,
      buffer: Uint8Array.from(archiveSection.palettes.level._palette).buffer,
    });
  }

  for (const segment of lightSegments) {
    if (archiveSection.light[segment].remapped) {
      palettes.light ??= {};
      palettes.light[segment] = BinaryBuffer.Create({
        format: BinaryBufferFormat.Uint8,
        buffer: Uint8Array.from(archiveSection.palettes.light[segment]._palette)
          .buffer,
      });
    }
  }

  if (archiveSection.secondaryVoxels.remapped) {
    palettes.secondary = BinaryBuffer.Create({
      format: BinaryBufferFormat.Uint16,
      buffer: Uint16Array.from(archiveSection.palettes.secondaryVoxels._palette)
        .buffer,
    });
  }

  const buffers: ArchivedSectionData["buffers"] = <any>{};

  //id
  if (archiveSection.voxels.allTheSame) {
    if (archiveSection.voxels.buffer[0] !== 0) {
      buffers.id = BinaryBuffer.Create({
        format: BinaryBufferFormat.Uint16,
        byteLength: archiveSection.original.ids.length,
        buffer: archiveSection.voxels.buffer[0],
      });
    }
  } else if (archiveSection.voxels.isPaletted) {
    const type = BinaryBuffer.DetermineSubByteArray(
      archiveSection.voxels.remapped
        ? archiveSection.palettes.voxels.size
        : sectorPalettes.voxels.size
    )!;
    buffers.id = BinaryBuffer.Create({
      buffer: BinaryBuffer.Convert(
        archiveSection.voxels.buffer,
        BinaryBufferFormat.Uint16,
        type
      ).buffer,
      format: type,
    });
  } else {
    buffers.id = BinaryBuffer.Create({
      buffer: archiveSection.voxels.buffer.buffer,
      format: BinaryBufferFormat.Uint16,
    });
  }

  //level
  if (archiveSection.level.allTheSame) {
    if (archiveSection.level.buffer[0] !== 0) {
      buffers.level = BinaryBuffer.Create({
        format: BinaryBufferFormat.Uint8,
        byteLength: archiveSection.original.level.length,
        buffer: archiveSection.voxels.buffer[0],
      });
    }
  } else if (archiveSection.level.isPaletted) {
    const type = BinaryBuffer.DetermineSubByteArray(
      archiveSection.level.remapped
        ? archiveSection.palettes.level.size
        : sectorPalettes.level.size
    )!;
    buffers.level = BinaryBuffer.Create({
      buffer: BinaryBuffer.Convert(
        archiveSection.level.buffer,
        BinaryBufferFormat.Uint8,
        type
      ).buffer,
      format: type,
    });
  } else {
    buffers.level = BinaryBuffer.Create({
      buffer: archiveSection.original.level.slice().buffer,
      byteLength: archiveSection.original.level.length,
      format: BinaryBufferFormat.Uint8,
    });
  }

  for (const segment of lightSegments) {
    if (archiveSection.light[segment].allTheSame) {
      if (archiveSection.light[segment].value !== 0) {
        buffers.light ??= {};
        buffers.light[segment] = BinaryBuffer.Create({
          format: BinaryBufferFormat.NibbleArray,
          buffer: archiveSection.light[segment].value,
          byteLength: archiveSection.original.light.length,
        });
      }
    } else if (archiveSection.light[segment].isPaletted) {
      const type = BinaryBuffer.DetermineSubByteArray(
        archiveSection.light[segment].remapped
          ? archiveSection.palettes.light[segment].size
          : sectorPalettes.light[segment].size
      )!;
      buffers.light ??= {};
      buffers.light[segment] = BinaryBuffer.Create({
        buffer: BinaryBuffer.Convert(
          archiveSection.light[segment].buffer,
          BinaryBufferFormat.Uint8,
          type
        ).buffer,
        format: type,
      });
    } else {
      buffers.light ??= {};
      buffers.light[segment] = BinaryBuffer.Create({
        buffer: getLightBuffer(segment, archiveSection.original.light).buffer,
        format: BinaryBufferFormat.NibbleArray,
        byteLength: archiveSection.original.light.length,
      });
    }
  }

  if (archiveSection.secondaryVoxels.allTheSame) {
    if (archiveSection.secondaryVoxels.buffer[0] !== 0) {
      buffers.secondary = BinaryBuffer.Create({
        format: BinaryBufferFormat.Uint16,
        byteLength: archiveSection.original.level.length,
        buffer: archiveSection.secondaryVoxels.buffer[0],
      });
    }
  } else if (archiveSection.secondaryVoxels.isPaletted) {
    const type = BinaryBuffer.DetermineSubByteArray(
      archiveSection.secondaryVoxels.remapped
        ? archiveSection.palettes.secondaryVoxels.size
        : sectorPalettes.voxels.size
    )!;
    buffers.secondary = BinaryBuffer.Create({
      buffer: BinaryBuffer.Convert(
        archiveSection.secondaryVoxels.buffer,
        BinaryBufferFormat.Uint16,
        type
      ).buffer,
      format: type,
    });
  } else {
    buffers.secondary = BinaryBuffer.Create({
      buffer: archiveSection.secondaryVoxels.buffer.buffer,
      format: BinaryBufferFormat.Uint16,
      byteLength: archiveSection.original.secondary.length,
    });
  }

  const flags = archiveSection.original.storeFlags();
  return {
    ...(Object.keys(flags).length ? { flags } : {}),
    ...(Object.keys(palettes).length ? { palettes } : {}),
    buffers,
  };
}

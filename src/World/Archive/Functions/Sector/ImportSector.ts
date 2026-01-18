import { WorldSpaces } from "../../../WorldSpaces";
import { Sector, SectorData } from "../../../index";
import { ArchivedSectorData } from "../../Types/index";
import { ImportedSector } from "../../Classes/ImportedSector";
import { Vector3Like } from "@amodx/math";
import { VoxelLUT } from "../../../../Voxels/Data/VoxelLUT";
import { VoxelTagsRegister } from "../../../../Voxels/Data/VoxelTagsRegister";
import { BinaryBufferFormat } from "../../../../Util/BinaryBuffer/index";
import { lightSemgnetSet } from "../../Functions/Shared/LightSegments";

type RunData = {
  version?: number;
};

export default function ImportSector(
  archivedSector: ArchivedSectorData,
  archiveData: RunData,
): SectorData {
  const sector = new Sector();

  sector.setBuffer(Sector.CreateNewBuffer());
  sector.position[0] = archivedSector.position.x;
  sector.position[1] = archivedSector.position.y;
  sector.position[2] = archivedSector.position.z;

  sector.loadFlags(archivedSector.flags);
  sector.loadTimestamps(archivedSector.timestamps);

  const importedSector = new ImportedSector(archivedSector);

  const position = Vector3Like.Create();
  const sectionVolume = WorldSpaces.section.volumne;

  for (const importedSection of importedSector.sections) {
    const archivedSection = importedSection.section;
    const section = sector.sections[importedSection.sectionIndex];
    archivedSection.flags && section.loadFlags(archivedSection.flags);
    section.dirtyMap.fill(0xff);

    const idsBuffer = importedSection.buffers.ids;
    const levelBuffer = importedSection.buffers.level;
    const secondaryBuffer = importedSection.buffers.secondary;
    const lightBuffers = importedSection.buffers.light;

    const sectionPalettes = importedSection.palettes;
    const sectorPalettes = importedSection.sector.palettes;
    const voxelReader = importedSection.sector.voxels;

    let voxelIdLUT: Uint16Array | null = null;
    if (!idsBuffer.isValue && sectionPalettes.voxels) {
      const paletteSize = sectionPalettes.voxels.size;
      voxelIdLUT = new Uint16Array(paletteSize);
      for (let p = 0; p < paletteSize; p++) {
        const paletteValue = sectionPalettes.voxels.getValue(p);
        voxelIdLUT[p] = VoxelLUT.getVoxelIdFromString(
          ...voxelReader.getVoxelData(paletteValue),
        );
      }
    }

    let secondaryIdLUT: Uint16Array | null = null;
    if (!secondaryBuffer.isValue && sectionPalettes.secondaryVoxels) {
      const paletteSize = sectionPalettes.secondaryVoxels.size;
      secondaryIdLUT = new Uint16Array(paletteSize);
      for (let p = 0; p < paletteSize; p++) {
        const paletteValue = sectionPalettes.secondaryVoxels.getValue(p);
        secondaryIdLUT[p] = VoxelLUT.getVoxelIdFromString(
          ...voxelReader.getVoxelData(paletteValue),
        );
      }
    }

    if (idsBuffer.isValue) {
      const voxelId = VoxelLUT.getVoxelIdFromString(
        ...voxelReader.getVoxelData(idsBuffer.getValue(0)),
      );
      section.ids.fill(voxelId);
    }

    if (levelBuffer.isValue) {
      let levelValue = levelBuffer.getValue(0);
      if (sectionPalettes.level) {
        levelValue = sectionPalettes.level.getValue(levelValue);
      } else if (sectorPalettes.level) {
        levelValue = sectorPalettes.level.getValue(levelValue);
      }
      section.level.fill(levelValue);
    }

    const sunIsValue = lightBuffers.sun.isValue;
    const redIsValue = lightBuffers.red.isValue;
    const greenIsValue = lightBuffers.green.isValue;
    const blueIsValue = lightBuffers.blue.isValue;

    if (sunIsValue && redIsValue && greenIsValue && blueIsValue) {
      let finalLight = 0;
      finalLight = lightSemgnetSet.sun(
        lightBuffers.sun.getValue(0),
        finalLight,
      );
      finalLight = lightSemgnetSet.red(
        lightBuffers.red.getValue(0),
        finalLight,
      );
      finalLight = lightSemgnetSet.green(
        lightBuffers.green.getValue(0),
        finalLight,
      );
      finalLight = lightSemgnetSet.blue(
        lightBuffers.blue.getValue(0),
        finalLight,
      );
      section.light.fill(finalLight);
    }

    const needsPerVoxelIds = !idsBuffer.isValue;
    const needsPerVoxelLevel = !levelBuffer.isValue;
    const needsPerVoxelSecondary = !secondaryBuffer.isValue;
    const needsPerVoxelLight = !(
      sunIsValue &&
      redIsValue &&
      greenIsValue &&
      blueIsValue
    );

    if (
      !needsPerVoxelIds &&
      !needsPerVoxelLevel &&
      !needsPerVoxelSecondary &&
      !needsPerVoxelLight
    ) {
      const staticId = section.ids[0];
      const trueVoxelId = VoxelLUT.voxelIdToTrueId[staticId];
      if (
        VoxelTagsRegister.VoxelTags[trueVoxelId]?.["dve_can_have_secondary"]
      ) {
        const secondaryValue = VoxelLUT.getVoxelIdFromString(
          ...voxelReader.getVoxelData(secondaryBuffer.getValue(0)),
        );
        section.secondary.fill(secondaryValue);
      }

      const staticSecondary = section.secondary[0];
      if (staticId !== 0 || staticSecondary !== 0) {
        for (let i = 0; i < sectionVolume; i++) {
          section.setHasVoxel(
            WorldSpaces.voxel.getPositionFromIndex(i, position).y - 1,
            true,
          );
        }
      }
      continue;
    }

    const sunPalette = sectionPalettes.light.sun || sectorPalettes.light.sun;
    const redPalette = sectionPalettes.light.red || sectorPalettes.light.red;
    const greenPalette =
      sectionPalettes.light.green || sectorPalettes.light.green;
    const bluePalette = sectionPalettes.light.blue || sectorPalettes.light.blue;

    const sunIsNibble =
      lightBuffers.sun.format === BinaryBufferFormat.NibbleArray;
    const redIsNibble =
      lightBuffers.red.format === BinaryBufferFormat.NibbleArray;
    const greenIsNibble =
      lightBuffers.green.format === BinaryBufferFormat.NibbleArray;
    const blueIsNibble =
      lightBuffers.blue.format === BinaryBufferFormat.NibbleArray;

    for (let i = 0; i < sectionVolume; i++) {
      let voxelId: number;

      if (needsPerVoxelIds) {
        const rawValue = idsBuffer.getValue(i);
        if (voxelIdLUT) {
          voxelId = voxelIdLUT[rawValue];
        } else {
          voxelId = VoxelLUT.getVoxelIdFromString(
            ...voxelReader.getVoxelData(rawValue),
          );
        }
        section.ids[i] = voxelId;
      } else {
        voxelId = section.ids[i];
      }

      if (needsPerVoxelLevel) {
        let levelValue = levelBuffer.getValue(i);
        if (sectionPalettes.level) {
          levelValue = sectionPalettes.level.getValue(levelValue);
        } else if (sectorPalettes.level) {
          levelValue = sectorPalettes.level.getValue(levelValue);
        }
        section.level[i] = levelValue;
      }

      if (needsPerVoxelLight) {
        let finalLight = 0;

        if (!sunIsValue) {
          let sunValue = lightBuffers.sun.getValue(i);
          if (!sunIsNibble && sunPalette) {
            sunValue = sunPalette.getValue(sunValue);
          }
          finalLight = lightSemgnetSet.sun(sunValue, finalLight);
        } else {
          finalLight = lightSemgnetSet.sun(
            lightBuffers.sun.getValue(0),
            finalLight,
          );
        }

        if (!redIsValue) {
          let redValue = lightBuffers.red.getValue(i);
          if (!redIsNibble && redPalette) {
            redValue = redPalette.getValue(redValue);
          }
          finalLight = lightSemgnetSet.red(redValue, finalLight);
        } else {
          finalLight = lightSemgnetSet.red(
            lightBuffers.red.getValue(0),
            finalLight,
          );
        }

        if (!greenIsValue) {
          let greenValue = lightBuffers.green.getValue(i);
          if (!greenIsNibble && greenPalette) {
            greenValue = greenPalette.getValue(greenValue);
          }
          finalLight = lightSemgnetSet.green(greenValue, finalLight);
        } else {
          finalLight = lightSemgnetSet.green(
            lightBuffers.green.getValue(0),
            finalLight,
          );
        }

        if (!blueIsValue) {
          let blueValue = lightBuffers.blue.getValue(i);
          if (!blueIsNibble && bluePalette) {
            blueValue = bluePalette.getValue(blueValue);
          }
          finalLight = lightSemgnetSet.blue(blueValue, finalLight);
        } else {
          finalLight = lightSemgnetSet.blue(
            lightBuffers.blue.getValue(0),
            finalLight,
          );
        }

        section.light[i] = finalLight;
      }

      const trueVoxelId = VoxelLUT.voxelIdToTrueId[voxelId];
      const rawSecondary = secondaryBuffer.getValue(i);

      if (
        VoxelTagsRegister.VoxelTags[trueVoxelId]?.["dve_can_have_secondary"]
      ) {
        if (secondaryIdLUT) {
          section.secondary[i] = secondaryIdLUT[rawSecondary];
        } else {
          section.secondary[i] = VoxelLUT.getVoxelIdFromString(
            ...voxelReader.getVoxelData(rawSecondary),
          );
        }
      } else {
        section.secondary[i] = 0;
      }

      if (section.ids[i] !== 0 || section.secondary[i] !== 0) {
        section.setHasVoxel(
          WorldSpaces.voxel.getPositionFromIndex(i, position).y - 1,
          true,
        );
      }
    }
  }

  sector.setBitFlag(Sector.FlagIds.stored, true);
  return sector;
}

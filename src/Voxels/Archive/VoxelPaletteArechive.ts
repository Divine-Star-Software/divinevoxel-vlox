import { BinaryBufferFormat } from "../../Util/BinaryBuffer";
import { BinaryBuffer } from "../../Util/BinaryBuffer/BinaryBuffer";
import { StringPalette } from "../../Util/StringPalette";
import { VoxelLUT } from "../Data/VoxelLUT";
import { VoxelSchemas } from "../State/VoxelSchemas";
import { VoxelBinaryStateSchemaNode } from "../State/State.types";
import {
  ArchivedVoxelDataForPalette,
  VoxelArchivePaletteData,
  ArchivedVoxelPaletteDataKey,
  VoxelPaletteCompents,
} from "./VoxelArchive.types";

export class VoxelArchivePalette {
  static GetVoxelPaletteDataKey(): ArchivedVoxelPaletteDataKey {
    return {
      stride: 3,
      components: [
        {
          type: VoxelPaletteCompents.VoxelId,
          index: 0,
        },
        {
          type: VoxelPaletteCompents.StateValue,
          index: 1,
        },
        {
          type: VoxelPaletteCompents.ModValue,
          index: 2,
        },
      ],
    };
  }
  get size() {
    return this._voxelCount;
  }
  _voxelsRegistered = new Map<number, number>();
  _ids = new StringPalette();
  _voxels: ArchivedVoxelDataForPalette[] = [];
  _stateShemas: Record<string, VoxelBinaryStateSchemaNode[]> = {};
  _voxelPalette: number[] = [];
  private _voxelCount = 0;

  register(id: number) {
    if (this._voxelsRegistered.has(id)) return this._voxelsRegistered.get(id)!;

    const stringId = VoxelLUT.voxelIds.getStringId(
      VoxelLUT.voxelIdToTrueId[id]
    );

    let voxelId = 0;
    if (!this._ids.isRegistered(stringId)) {
      voxelId = this._ids.register(stringId);
      const modelId = VoxelLUT.models.getStringId(
        VoxelLUT.modelsIndex[VoxelLUT.voxelIds.getNumberId(stringId)]
      );
      const stateData = VoxelSchemas.getStateSchema(stringId)?.getSchema();
      const modData = VoxelSchemas.mod.get(stringId)?.getSchema();
      if (stateData && stateData?.length) {
        this._stateShemas[modelId] = stateData;
      }
      const voxelData: ArchivedVoxelDataForPalette = {
        id: stringId,
        ...(modData && modData.length ? { modSchema: modData } : {}),
        ...(this._stateShemas[modelId] ? { stateSchemaId: modelId } : {}),
      };

      const name = VoxelLUT.voxelNametoIdMap.get(stringId);
      if (name !== undefined && name !== stringId) {
        voxelData.name = name;
      }
      this._voxels[voxelId] = voxelData;
    } else {
      voxelId = this._ids.getNumberId(stringId);
    }

    const state = VoxelLUT.voxelIdToState[id];
    const mod = VoxelLUT.voxelIdToMod[id];
    this._voxelPalette.push(voxelId, state, mod);
    const paletteId = this._voxelCount;
    this._voxelsRegistered.set(id, paletteId);
    this._voxelCount++;
    return paletteId;
  }

  toJSON(): VoxelArchivePaletteData {
    return {
      voxels: this._voxels,
      voxelPalette: BinaryBuffer.Create({
        format: BinaryBufferFormat.Uint16,
        byteLength: this._voxelPalette.length,
        buffer: new Uint16Array(this._voxelPalette).buffer,
      }),
      stateSchemas: this._stateShemas,
    };
  }
}

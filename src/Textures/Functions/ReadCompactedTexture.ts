import { CompactedTextureReader } from "../Classes/CompactedTextureReader";
import {
  CompactedTextureData,
  CompactedTextureNodeData,
  TextureData,
  TextureDataBase,
} from "../Texture.types";

function findVarationTextureData(id: string, textureData: TextureData) {
  if (!textureData.variations) return null;
  for (let i = 0; i < textureData.variations.length; i++) {
    if (
      typeof textureData.variations[i] == "string" &&
      textureData.variations[i] == id
    ) {
      const data: TextureDataBase = {
        id,
      };
      textureData.variations[i] = data;
      return data;
    } else if ((textureData.variations[i] as TextureDataBase).id == id) {
      return textureData.variations[i] as TextureDataBase;
    }
  }
  return null;
}

export async function ReadCompactedTexture(
  data: CompactedTextureData,
  textures: TextureData[],
  path: string
): Promise<void> {
  const textureMap = new Map<string, TextureData>();
  const compactedTextureMap = new Map<string, CompactedTextureNodeData>();
  for (const textureData of textures) {
    textureMap.set(textureData.id, textureData);
  }
  for (const textureData of data.nodes) {
    compactedTextureMap.set(textureData.id, textureData);
  }

  const compactedTextureReader = new CompactedTextureReader();
  compactedTextureReader.setSize(data.size, data.textureSize);
  await compactedTextureReader.loadImage(path);

  for (const node of data.nodes) {
    const textureData = textureMap.get(node.id)!;
    textureData.base64 = (await compactedTextureReader.readImage(node)).src;

    if (node.variations) {
      for (const varation of node.variations) {
        const data = findVarationTextureData(varation.id, textureData)!;
        data.base64 = (await compactedTextureReader.readImage(varation)).src;
      }
    }
  }
}

import { Vec2Array } from "@amodx/math";
import {
  CompactedTextureData,
  CompactedTextureNodeBaseData,
  CompactedTextureNodeData,
  TextureData,
} from "../Texture.types";
import { TextureLoader } from "../Classes/TextureLoader";
import { CompactedTextureReader } from "../Classes/CompactedTextureReader";

async function process(
  loader: TextureLoader,
  reader: CompactedTextureReader,
  node: CompactedTextureNodeBaseData,
  data: TextureData,
  textureIndex: number,
  parent: string | null
) {
  const imagePath = loader.getImagePath(data, parent);

  if (!data.atlas) {
    const loadedImage = await loader.loadImage(imagePath);
    reader.writeImage(textureIndex, loadedImage);
    node.index = textureIndex;
    return textureIndex + 1;
  }
  node.atlas = data.atlas.tiles;
  const tiles = await loader.sliceImageIntoTiles(
    imagePath,
    ...data.atlas.tiles
  );
  node.index = [];
  for (let i = 0; i < tiles.length; i++) {
    node.index.push(textureIndex + i);
    await reader.writeImage(textureIndex + i, tiles[i]);
  }

  return textureIndex + tiles.length;
}
export async function CreateCompactedTexture(
  type: string,
  baseURL: string,
  size: Vec2Array,
  textures: TextureData[]
): Promise<{ data: CompactedTextureData; image: HTMLImageElement }> {
  const defaultBaseURL = baseURL || "assets/textures";
  const compatexTextureData: CompactedTextureData = {
    type,
    size: [0, 0],
    textureSize: size,
    nodes: [],
  };

  let totalImageCount = 0;
  for (const textureData of textures) {
    if (!textureData.variations?.length) {
      if (textureData.atlas) {
        totalImageCount +=
          textureData.atlas.tiles[0] * textureData.atlas.tiles[1];
      } else {
        totalImageCount++;
      }

      continue;
    }
    if (textureData.variations) {
      for (const varation of textureData.variations) {
        if (typeof varation == "string") {
          totalImageCount++;
          continue;
        }
        if (varation.atlas) {
          totalImageCount += varation.atlas.tiles[0] * varation.atlas.tiles[1];
        } else {
          totalImageCount++;
        }
      }
    }
  }

  const width = Math.ceil(Math.sqrt(totalImageCount)) * size[0];
  const height = Math.ceil(Math.sqrt(totalImageCount)) * size[1];
  compatexTextureData.size = [width, height];
  const loader = new TextureLoader();
  loader.setSize(size);

  const compactedTextureReader = new CompactedTextureReader();
  compactedTextureReader.setSize([width, height], size);

  let textureIndex = 0;

  for (const textureData of textures) {
    if (textureData.basePath) {
      loader.baseURL = textureData.basePath;
    } else {
      loader.baseURL = defaultBaseURL;
    }
    const baseNode: CompactedTextureNodeData = {
      id: textureData.id,
      index: 0,
    };
    compatexTextureData.nodes.push(baseNode);
    if (!textureData?.variations?.length) {
      textureIndex = await process(
        loader,
        compactedTextureReader,
        baseNode,
        textureData,
        textureIndex,
        null
      );
    }

    if (textureData.variations) {
      baseNode.variations = [];
      for (let varation of textureData.variations) {
        if (typeof varation == "string") {
          varation = { id: varation };
        }
        if (varation.basePath) {
          loader.baseURL = varation.basePath;
        } else {
          loader.baseURL = defaultBaseURL;
        }

        const varationNode: CompactedTextureNodeBaseData = {
          id: varation.id,
          index: 0,
        };
        baseNode.variations.push(varationNode);
        textureIndex = await process(
          loader,
          compactedTextureReader,
          varationNode,
          varation,
          textureIndex,
          textureData.id
        );
      }
    }
  }

  return {
    data: compatexTextureData,
    image: compactedTextureReader.getFinalImage(),
  };
}

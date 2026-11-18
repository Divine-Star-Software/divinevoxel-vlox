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
    reader.writeImage(textureIndex + i, tiles[i]);
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
  const compactedTextureData: CompactedTextureData = {
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
      for (const variation of textureData.variations) {
        if (typeof variation == "string") {
          totalImageCount++;
          continue;
        }
        if (variation.atlas) {
          totalImageCount += variation.atlas.tiles[0] * variation.atlas.tiles[1];
        } else {
          totalImageCount++;
        }
      }
    }
  }

  const width = Math.ceil(Math.sqrt(totalImageCount)) * size[0];
  const height = Math.ceil(Math.sqrt(totalImageCount)) * size[1];
  compactedTextureData.size = [width, height];
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
    compactedTextureData.nodes.push(baseNode);
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
      for (let variation of textureData.variations) {
        if (typeof variation == "string") {
          variation = { id: variation };
          if (textureData.basePath) variation.basePath = textureData.basePath;
        }
        if (variation.basePath) {
          loader.baseURL = variation.basePath;
        } else {
          loader.baseURL = defaultBaseURL;
        }

        const variationNode: CompactedTextureNodeBaseData = {
          id: variation.id,
          index: 0,
        };
        baseNode.variations.push(variationNode);
        textureIndex = await process(
          loader,
          compactedTextureReader,
          variationNode,
          variation,
          textureIndex,
          textureData.id
        );
      }
    }
  }

  return {
    data: compactedTextureData,
    image: compactedTextureReader.getFinalImage(),
  };
}

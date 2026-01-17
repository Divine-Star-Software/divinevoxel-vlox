import { CompiledTexture } from "../Classes/CompiledTexture";
import { TextureData } from "../../Textures/Texture.types";
import { CompiledTextureAnimation } from "../../Textures/Classes/CompiledTextureAnimation";
import { WorkItemProgress } from "../../Util/WorkItemProgress";
import { TextureLoader } from "../Classes/TextureLoader";

let loader: TextureLoader;

function createAnimationData(
  atlas: TextureData["atlas"],
  data: TextureData["animated"],
  startIndex: number
): CompiledTextureAnimation {
  const compiled = new CompiledTextureAnimation(startIndex);
  if (!data?.frames) {
    const maxFrames = atlas!.tiles[0] * atlas!.tiles[1];
    for (let i = 0; i < maxFrames; i++) {
      compiled!._frames[i] = i;
      compiled._times[i] = data!.frameTime!;
    }
  } else {
    for (let i = 0; i < data.frames.length; i++) {
      const frameData = data.frames[i];
      if (typeof frameData == "number") {
        compiled!._frames[i] = frameData;
        compiled._times[i] = data!.frameTime!;
        continue;
      }
      compiled!._frames[i] = frameData.index;
      compiled._times[i] = frameData.time;
    }
  }

  if (data?.pingPong) {
    compiled!._frames = [
      ...compiled._frames,
      ...compiled._frames.toReversed().slice(1, compiled._frames.length - 1),
    ];
    compiled!._times = [
      ...compiled._times,
      ...compiled._times.toReversed().slice(1, compiled._times.length - 1),
    ];
  }
  return compiled;
}

async function process(
  compiled: CompiledTexture,
  data: TextureData,
  textureIndex: number,
  parent: string | null,
  cache = false
) {
  const textureId = loader.getTextureId(data, parent);
  compiled.textureMap[textureId] = textureIndex;
  const imagePath = loader.getImagePath(data, parent);
  if (cache) {
    data.base64 = await loader.getImageBase64(imagePath);
  }
  if (!data.atlas) {
    compiled.images[textureIndex] = await loader.loadImageForShader(imagePath);
    return textureIndex + 1;
  }
  const tiles = await loader.sliceImageIntoTiles(
    imagePath,
    ...data.atlas.tiles
  );
  for (let i = 0; i < tiles.length; i++) {
    compiled.images[textureIndex + i] = await loader.loadImageForShader(
      tiles[i].src
    );
  }
  compiled.atlasSizeMap[textureId] = data.atlas.tiles;
  if (data.animated) {
    compiled.animations.push(
      createAnimationData(data.atlas, data.animated, textureIndex)
    );
  }

  if (data.atlas.namedTiles) {
    for (const named of data.atlas.namedTiles) {
      let tIndex = Array.isArray(named.index)
        ? CompiledTexture.GetAtlasIndex(...named.index, data.atlas.tiles[0])
        : named.index;
      compiled.textureMap[`${textureId}:${named.id}`] = textureIndex + tIndex;
    }
  }

  return textureIndex + tiles.length;
}

export type BuildTextureDataProps = {
  type: string;
  baseURL?: string;
  createCache?: boolean;
  textures: TextureData[];
  finalSize?: [width: number, height: number];
};

export async function BuildTextureData(
  { type, baseURL, textures, finalSize, createCache }: BuildTextureDataProps,
  progress: WorkItemProgress
): Promise<CompiledTexture> {
  const defaultBaseURL = baseURL || "assets/textures";
  if (!loader) {
    loader = new TextureLoader();
  }
  loader.setSize(finalSize || [16, 16]);

  const compiled = new CompiledTexture(type);


  let count = 0;
  for (const texture of textures) {
    progress.completeWorkItems(1);
    progress.setStatus(`Building Texture ${type} | ${texture.id}`);
    if (texture.basePath) {
      loader.baseURL = texture.basePath;
    } else {
      loader.baseURL = defaultBaseURL;
    }
    if (!texture.variations?.length) {
      try {
        count = await process(compiled, texture, count, null, createCache);
        continue;
      } catch (error) {
        console.warn(`Could not load texture ${texture.id}`);
        console.error(error);
        continue;
      }
    }

    if (texture.variations) {
      for (let i = 0; i < texture.variations.length; i++) {
        const vara = texture.variations[i];
        if (texture.basePath) {
          loader.baseURL = texture.basePath;
        } else {
          loader.baseURL = defaultBaseURL;
        }

        if (typeof vara == "string") {
          const newData: TextureData = { type: texture.type, id: vara };
          try {
            count = await process(
              compiled,
              newData,
              count,
              texture.id,
              createCache
            );
            if (createCache) texture.variations[i] = newData;
            continue;
          } catch (error) {
            console.warn(`Could not load texture ${texture.id}`);
            console.error(error);
            continue;
          }
        }
        try {
          if (vara.basePath) {
            loader.baseURL = vara.basePath;
          } else {
            loader.baseURL = defaultBaseURL;
          }

          count = await process(compiled, vara, count, texture.id, createCache);
        } catch (error) {
          console.warn(`Could not load texture ${texture.id}`);
          console.error(error);
          continue;
        }
      }
    }
  }


  return compiled;
}

import { Vec2Array } from "@amodx/math";
import { TextureAtlasIndex } from "./TextureAtlasIndex";
import { CompactedTextureNodeBaseData } from "Textures/Texture.types";

export class CompactedTextureReader {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  atlasCanvas: HTMLCanvasElement;
  atlasContext: CanvasRenderingContext2D;

  textureCanvas: HTMLCanvasElement;
  textureContext: CanvasRenderingContext2D;

  index = new TextureAtlasIndex();

  atlasIndex = new TextureAtlasIndex();
  size: Vec2Array;
  textureSize: Vec2Array;
  constructor() {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d", {
      willReadFrequently: true,
    })!;
    this.context.imageSmoothingEnabled = false;

    this.atlasCanvas = document.createElement("canvas");
    this.atlasContext = this.atlasCanvas.getContext("2d", {
      willReadFrequently: true,
    })!;
    this.atlasContext.imageSmoothingEnabled = false;

    this.textureCanvas = document.createElement("canvas");
    this.textureContext = this.textureCanvas.getContext("2d", {
      willReadFrequently: true,
    })!;
    this.textureContext.imageSmoothingEnabled = false;
    if (!this.context)
      throw new Error(`Error could not create CanvasRenderingContext2D`);
  }

  setSize(size: Vec2Array, textureSize: Vec2Array) {
    this.index.setBounds([size[0] / textureSize[0], size[1] / textureSize[1]]);
    this.size = size;
    this.canvas.width = size[0];
    this.canvas.height = size[1];
    this.textureCanvas.width = textureSize[0];
    this.textureCanvas.height = textureSize[1];
    this.textureSize = textureSize;
  }

  loadImage(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onerror = reject;
      image.src = path;
      image.onload = () => {
        this.context.drawImage(
          image,
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );
        resolve(true);
      };
    });
  }

  getFinalImage() {
    const image = new Image();
    image.src = this.canvas.toDataURL("image/png");
    return image;
  }

  writeImage(index: number, image: HTMLImageElement) {
    const [x, y] = this.index.getPosition(index);
    this.context.drawImage(
      image,
      x * this.textureSize[0],
      y * this.textureSize[1],
      this.textureSize[0],
      this.textureSize[1]
    );
  }

  async readImage(
    data: CompactedTextureNodeBaseData
  ): Promise<HTMLImageElement> {
    if (!Array.isArray(data.index)) {
      return this.readImageAtIndex(data.index);
    }
    const atlas = data.atlas!;
    this.atlasCanvas.width = atlas[0] * this.textureSize[0];
    this.atlasCanvas.height = atlas[1] * this.textureSize[1];
    this.atlasContext.clearRect(
      0,
      0,
      this.atlasCanvas.width,
      this.atlasCanvas.height
    );
    this.atlasIndex.setBounds(atlas);
    const startIndex = data.index[0];
    for (const index of data.index) {
      const [x, y] = this.atlasIndex.getPosition(index - startIndex);
      const image = await this.readImageAtIndex(index);
      this.atlasContext.drawImage(
        image,
        x * this.textureSize[0],
        y * this.textureSize[1],
        this.textureSize[0],
        this.textureSize[1]
      );
    }

    const image = new Image();
    image.src = this.atlasCanvas.toDataURL("image/png");
    return image;
  }

  async readImageAtIndex(index: number): Promise<HTMLImageElement> {
    const tileWidth = this.textureSize[0];
    const tileHeight = this.textureSize[1];
    const [x, y] = this.index.getPosition(index);
    this.textureContext.clearRect(0, 0, tileWidth, tileHeight);
    this.textureContext.drawImage(
      this.canvas,
      x * tileWidth,
      y * tileHeight,
      tileWidth,
      tileHeight,
      0,
      0,
      tileWidth,
      tileHeight
    );

    const image = new Image();
    image.src = this.textureCanvas.toDataURL("image/png");
    return image;
  }
}

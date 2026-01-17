import { Vec2Array } from "@amodx/math";
import { TextureData } from "../Texture.types";
import { TextureAtlasIndex } from "./TextureAtlasIndex";

export class TextureLoader {
  baseURL = "assets/textures";
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  atlasCanvas: HTMLCanvasElement;
  atlasContext: CanvasRenderingContext2D;
  size: Vec2Array;

  atlasIndex = new TextureAtlasIndex();
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
    if (!this.context)
      throw new Error(`Error could not create CanvasRenderingContext2D`);
  }

  setSize(size: Vec2Array) {
    this.size = size;
    this.canvas.width = size[0];
    this.canvas.height = size[1];
  }

  async getImageBase64(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  }

  loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }

  async sliceImageIntoTiles(
    src: string,
    tilesX: number,
    tilesY: number
  ): Promise<HTMLImageElement[]> {
    const image = await this.loadImage(src);
    this.atlasIndex.setBounds([tilesX, tilesY]);

    const tileWidth = image.width / tilesX;
    const tileHeight = image.height / tilesY;

    this.atlasCanvas.width = tileWidth;
    this.atlasCanvas.height = tileHeight;

    const tiles: HTMLImageElement[] = [];

    for (let x = 0; x < tilesX; x++) {
      for (let y = 0; y < tilesY; y++) {
        this.atlasContext.clearRect(0, 0, tileWidth, tileHeight);
        this.atlasContext.drawImage(
          image,
          x * tileWidth,
          y * tileHeight,
          tileWidth,
          tileHeight,
          0,
          0,
          tileWidth,
          tileHeight
        );
        tiles[this.atlasIndex.getIndex(x, y)] = await this.loadImage(
          this.atlasCanvas.toDataURL("image/png")
        );
      }
    }

    return tiles;
  }

  getImagePath(data: TextureData, parentId: string | null = null) {
    if (data.base64) return data.base64;
    if (data.path) return data.path;
    if (!parentId) return `${this.baseURL}/${data.id}.png`;
    return `${this.baseURL}/${parentId}/${data.id}.png`;
  }

  getTextureId(data: TextureData, parentId: string | null = null) {
    return `${parentId ? parentId : data.id}${!parentId ? "" : ":" + data.id}`;
  }

  async loadImageForShader(
    imgSrcData: string | HTMLImageElement
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = typeof imgSrcData === "string" ? new Image() : imgSrcData;
      image.onerror = reject;

      if (typeof imgSrcData === "string") image.src = imgSrcData;

      image.onload = () => {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.save();
        this.context.translate(0, this.canvas.height);
        this.context.scale(1, -1);
        this.context.drawImage(
          image,
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );
        this.context.restore();

        const dataUrl = this.canvas.toDataURL("image/png");
        const returnImage = new Image(this.canvas.width, this.canvas.height);
        returnImage.src = dataUrl;
        returnImage.onload = () => resolve(returnImage);
      };
    });
  }
}

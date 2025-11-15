import { QuadVerticies } from "../Geomtry/Geometry.types";
import { Quad } from "../Geomtry/Primitives/Quad";
import { ItemModelBuilder } from "./Models/ItemModelBuilder";
import { addItemQuad } from "./Geomtry/ItemGeometryBuilder";
import { Flat2DIndex, Vec2Array, Vector3Like } from "@amodx/math";
import { Box } from "../Geomtry/Shapes/Box";
import { VoxelFaces } from "../../Math";
import { CompactItemMesh } from "./Base/CompactItemMesh";

const { quads: Quads } = Box.Create([
  [0, 0, 0],
  [1, 1, 1],
]);
const addUvs = (
  quad: Quad,
  factor: number,
  sx: number,
  sy: number,
  ex: number,
  ey: number
) => {
  const uR = ex * factor;
  const uL = sx * factor;
  const vT = ey * factor;
  const vB = sy * factor;

  quad.uvs.vertices[QuadVerticies.TopRight].x = uR;
  quad.uvs.vertices[QuadVerticies.TopRight].y = vT;

  quad.uvs.vertices[QuadVerticies.TopLeft].x = uL;
  quad.uvs.vertices[QuadVerticies.TopLeft].y = vT;

  quad.uvs.vertices[QuadVerticies.BottomLeft].x = uL;
  quad.uvs.vertices[QuadVerticies.BottomLeft].y = vB;

  quad.uvs.vertices[QuadVerticies.BottomRight].x = uR;
  quad.uvs.vertices[QuadVerticies.BottomRight].y = vB;
};

class TextureVoxelData {
  index = Flat2DIndex.GetXYOrder();

  constructor(
    public width: number,
    public height: number,
    public textureData: number[]
  ) {
    this.index.setBounds(width, height);
  }

  inBounds(x: number, y: number) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  isSolid(x: number, y: number) {
    if (!this.inBounds(x, y)) return false;

    const a =
      this.textureData[this.index.getIndexXY(x, this.height - 1 - y) * 4 + 3];
    return a > 0.01;
  }
}
Quads[VoxelFaces.North].setUVs(Quad.FullUVs as any);
Quads[VoxelFaces.South].setUVs(Quad.FullUVs as any);

const tool = new ItemModelBuilder("dve_item");
export function MeshTexture(textureId: number, textureData: number[]) {
  const width = Math.sqrt(textureData.length / 4);
  const height = Math.sqrt(textureData.length / 4);
  const factor = 1 / width;

  const data = new TextureVoxelData(width, height, textureData);

  {
    //south face
    tool.vars.textureIndex = textureId;
    addItemQuad(tool, Quads[VoxelFaces.South]);
  }

  {
    //north face
    const backPositionZ = factor;

    Quads[VoxelFaces.North].positions.vertices[QuadVerticies.TopRight].z =
      backPositionZ;
    Quads[VoxelFaces.North].positions.vertices[QuadVerticies.TopLeft].z =
      backPositionZ;
    Quads[VoxelFaces.North].positions.vertices[QuadVerticies.BottomLeft].z =
      backPositionZ;
    Quads[VoxelFaces.North].positions.vertices[QuadVerticies.BottomRight].z =
      backPositionZ;

    tool.vars.textureIndex = textureId;
    addItemQuad(tool, Quads[VoxelFaces.North]);
  }

  for (let x = 0; x < width; x++) {
    let eastFace: Vec2Array | null = null;
    let westFace: Vec2Array | null = null;
    for (let y = 0; y < height; y++) {
      let eastFaceExposed = true;
      let westFaceExposed = true;

      if (!data.isSolid(x, y)) {
        eastFaceExposed = false;
        westFaceExposed = false;
      }
      if (data.isSolid(x + 1, y)) {
        eastFaceExposed = false;
      }
      if (data.isSolid(x - 1, y)) {
        westFaceExposed = false;
      }

      if (eastFace && !eastFaceExposed) {
        const x1 = x * factor + factor;
        const y0 = eastFace[1] * factor;
        const y1 = y * factor;
        const z0 = 0;
        const z1 = factor;

        // Flip winding vs previous: (p1 <-> p3)
        const newQuad = Quad.Create(
          [
            [x1, y0, z0], // p0
            [x1, y0, z1], // p1 (was p3)
            [x1, y1, z1], // p2
            [x1, y1, z0], // p3 (was p1)
          ],
          Quad.FullUVs as any,
          false
        );

        let [sx, sy] = eastFace;
        let ex = x + 1;
        let ey = y;
        addUvs(newQuad, factor, sx, sy, ex, ey);
        eastFace = null;

        tool.vars.textureIndex = textureId;
        addItemQuad(tool, newQuad);
      }

      if (westFace && !westFaceExposed) {
        const x0 = x * factor;
        const y0 = westFace[1] * factor;
        const y1 = y * factor;
        const z0 = 0;
        const z1 = factor;

        // Flip winding vs previous: (p1 <-> p3)
        const newQuad = Quad.Create(
          [
            [x0, y0, z0], // p0
            [x0, y1, z0], // p1 (was p3)
            [x0, y1, z1], // p2
            [x0, y0, z1], // p3 (was p1)
          ],
          Quad.FullUVs as any,
          false
        );

        let [sx, sy] = westFace;
        let ex = x + 1;
        let ey = y;
        addUvs(newQuad, factor, sx, sy, ex, ey);
        westFace = null;

        tool.vars.textureIndex = textureId;
        addItemQuad(tool, newQuad);
      }
      const isPixel = data.isSolid(x, y);
      if (!data.isSolid(x + 1, y) && !eastFace && isPixel) {
        eastFace = [x, y];
      }
      if (!data.isSolid(x - 1, y) && !westFace && isPixel) {
        westFace = [x, y];
      }
    }
  }
  for (let y = 0; y < height; y++) {
    let upFace: Vec2Array | null = null;
    let downFace: Vec2Array | null = null;

    for (let x = 0; x < width; x++) {
      let upFaceExposed = true;
      let downFaceExposed = true;

      if (!data.isSolid(x, y)) {
        upFaceExposed = false;
        downFaceExposed = false;
      }
      if (data.isSolid(x, y + 1)) {
        upFaceExposed = false;
      }
      if (data.isSolid(x, y - 1)) {
        downFaceExposed = false;
      }

      if (upFace && !upFaceExposed) {
        const x0 = upFace[0] * factor;
        const x1 = x * factor;
        const y1 = y * factor + factor;
        const z0 = 0;
        const z1 = factor;

        // +Y normal — CCW when viewed from +Y
        const newQuad = Quad.Create(
          [
            [x0, y1, z0], // p0
            [x1, y1, z0], // p1
            [x1, y1, z1], // p2
            [x0, y1, z1], // p3
          ],
          Quad.FullUVs as any,
          false
          // 0
        );

        let [sx, sy] = upFace;
        let [ex, ey] = [x, y];
        ey += 1;
        addUvs(newQuad, factor, sx, sy, ex, ey);
        upFace = null;
        tool.vars.textureIndex = textureId;
        addItemQuad(tool, newQuad);
      }

      if (downFace && !downFaceExposed) {
        const x0 = downFace[0] * factor;
        const x1 = x * factor;
        const y0 = y * factor;
        const z0 = 0;
        const z1 = factor;

        // -Y normal — flip winding relative to +Y
        const newQuad = Quad.Create(
          [
            [x0, y0, z0], // p0
            [x0, y0, z1], // p1
            [x1, y0, z1], // p2
            [x1, y0, z0], // p3
          ],
          Quad.FullUVs as any,
          false
          // 1
        );

        let [sx, sy] = downFace;
        let [ex, ey] = [x, y];
        ey += 1;
        addUvs(newQuad, factor, sx, sy, ex, ey);
        downFace = null;
        tool.vars.textureIndex = textureId;
        addItemQuad(tool, newQuad);
      }

      const isPixel = data.isSolid(x, y);
      if (!data.isSolid(x, y + 1) && !upFace && isPixel) {
        upFace = [x, y];
      }
      if (!data.isSolid(x, y - 1) && !downFace && isPixel) {
        downFace = [x, y];
      }
    }
  }

  return CompactItemMesh([tool]);
}

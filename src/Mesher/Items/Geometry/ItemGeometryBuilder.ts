import { Vector3Like, Vector2Like } from "@amodx/math";
import { ItemModelBuilder } from "../Models/ItemModelBuilder";

import { Quad } from "../../Geometry/Primitives/Quad";
import { QuadVertices } from "../../Geometry/Geometry.types";
import { ItemMeshVertexConstants } from "./ItemMeshVertexStructCursor";
import { Triangle } from "../../Geometry/Primitives";

export function addItemTriangle(builder: ItemModelBuilder, tri: Triangle) {
  if (!builder.mesh) return;

  const origin = builder.origin;
  const texture = builder.vars.textureIndex;

  const topRightPos = tri.positions.vertices[0];
  const topLeftPos = tri.positions.vertices[1];
  const bottomLeftPos = tri.positions.vertices[2];

  const topRightNor = tri.normals.vertices[0];
  const topLeftNor = tri.normals.vertices[1];
  const bottomLeftNor = tri.normals.vertices[2];

  const indices = builder.mesh!.indices;
  let indIndex = builder.mesh.indicesCount;
  let sides = tri.doubleSided ? 2 : 1;

  const baseIndex = builder.mesh.vertexCount;

  while (sides--) {
    const baseIndex = builder.mesh.vertexCount;
    builder.mesh.buffer.setIndex(baseIndex);
    addVertex(
      builder.mesh.buffer.currentIndex,
      builder.mesh.buffer.currentFloat32Array,
      origin,
      topRightPos,
      topRightNor,
      tri.uvs.vertices[QuadVertices.TopRight],

      texture
    );

    builder.mesh.buffer.setIndex(baseIndex + 1);
    addVertex(
      builder.mesh.buffer.currentIndex,
      builder.mesh.buffer.currentFloat32Array,
      origin,
      topLeftPos,
      topLeftNor,
      tri.uvs.vertices[QuadVertices.TopLeft],

      texture
    );
    builder.mesh.buffer.setIndex(baseIndex + 2);
    addVertex(
      builder.mesh.buffer.currentIndex,
      builder.mesh.buffer.currentFloat32Array,
      origin,
      bottomLeftPos,
      bottomLeftNor,
      tri.uvs.vertices[QuadVertices.BottomLeft],

      texture
    );

    builder.mesh.addVertices(3, 3);
  }
  if (!tri.doubleSided) {
    let index = baseIndex;
    indices.setIndex(indIndex).currentArray[indices.currentIndex] = index;
    indices.setIndex(indIndex + 1).currentArray[indices.currentIndex] =
      index + 1;
    indices.setIndex(indIndex + 2).currentArray[indices.currentIndex] =
      index + 2;
  } else {
    let index = baseIndex;
    indices.setIndex(indIndex).currentArray[indices.currentIndex] = index;
    indices.setIndex(indIndex + 1).currentArray[indices.currentIndex] =
      index + 1;
    indices.setIndex(indIndex + 2).currentArray[indices.currentIndex] =
      index + 2;
    index += 3;
    indIndex += 3;
    indices.setIndex(indIndex).currentArray[indices.currentIndex] = index + 3;
    indices.setIndex(indIndex + 1).currentArray[indices.currentIndex] =
      index + 2;
    indices.setIndex(indIndex + 2).currentArray[indices.currentIndex] =
      index + 1;
  }

  builder.vars.reset();
}

export function addItemQuad(builder: ItemModelBuilder, quad: Quad) {
  if (!builder.mesh) return;

  const origin = builder.origin;
  const texture = builder.vars.textureIndex;
  const topRightPos = quad.positions.vertices[0];
  const topLeftPos = quad.positions.vertices[1];
  const bottomLeftPos = quad.positions.vertices[2];
  const bottomRightPos = quad.positions.vertices[3];
  const topRightNor = quad.normals.vertices[0];
  const topLeftNor = quad.normals.vertices[1];
  const bottomLeftNor = quad.normals.vertices[2];
  const bottomRightNor = quad.normals.vertices[3];

  const indices = builder.mesh!.indices;
  let indIndex = builder.mesh.indicesCount;

  const baseIndex = builder.mesh.vertexCount;
  builder.mesh.buffer.setIndex(baseIndex);
  addVertex(
    builder.mesh.buffer.currentIndex,
    builder.mesh.buffer.currentFloat32Array,
    origin,
    topRightPos,
    topRightNor,
    quad.uvs.vertices[QuadVertices.TopRight],

    texture
  );

  builder.mesh.buffer.setIndex(baseIndex + 1);
  addVertex(
    builder.mesh.buffer.currentIndex,
    builder.mesh.buffer.currentFloat32Array,
    origin,
    topLeftPos,
    topLeftNor,
    quad.uvs.vertices[QuadVertices.TopLeft],

    texture
  );
  builder.mesh.buffer.setIndex(baseIndex + 2);
  addVertex(
    builder.mesh.buffer.currentIndex,
    builder.mesh.buffer.currentFloat32Array,
    origin,
    bottomLeftPos,
    bottomLeftNor,
    quad.uvs.vertices[QuadVertices.BottomLeft],

    texture
  );
  builder.mesh.buffer.setIndex(baseIndex + 3);
  addVertex(
    builder.mesh.buffer.currentIndex,
    builder.mesh.buffer.currentFloat32Array,
    origin,
    bottomRightPos,
    bottomRightNor,
    quad.uvs.vertices[QuadVertices.BottomRight],

    texture
  );

  if (!quad.doubleSided) {
    let index = baseIndex;
    indices.setIndex(indIndex).currentArray[indices.currentIndex] = index;
    indices.setIndex(indIndex + 1).currentArray[indices.currentIndex] =
      index + 1;
    indices.setIndex(indIndex + 2).currentArray[indices.currentIndex] =
      index + 2;
    indices.setIndex(indIndex + 3).currentArray[indices.currentIndex] =
      index + 2;
    indices.setIndex(indIndex + 4).currentArray[indices.currentIndex] =
      index + 3;
    indices.setIndex(indIndex + 5).currentArray[indices.currentIndex] = index;
    builder.mesh.addVertices(4, 6);
  } else {
    let index = baseIndex;
    indices.setIndex(indIndex).currentArray[indices.currentIndex] = index;
    indices.setIndex(indIndex + 1).currentArray[indices.currentIndex] =
      index + 1;
    indices.setIndex(indIndex + 2).currentArray[indices.currentIndex] =
      index + 2;
    indices.setIndex(indIndex + 3).currentArray[indices.currentIndex] =
      index + 2;
    indices.setIndex(indIndex + 4).currentArray[indices.currentIndex] =
      index + 3;
    indices.setIndex(indIndex + 5).currentArray[indices.currentIndex] = index;
    indIndex += 6;
    indices.setIndex(indIndex).currentArray[indices.currentIndex] = index;
    indices.setIndex(indIndex + 1).currentArray[indices.currentIndex] =
      index + 3;
    indices.setIndex(indIndex + 2).currentArray[indices.currentIndex] =
      index + 2;
    indices.setIndex(indIndex + 3).currentArray[indices.currentIndex] =
      index + 2;
    indices.setIndex(indIndex + 4).currentArray[indices.currentIndex] =
      index + 1;
    indices.setIndex(indIndex + 5).currentArray[indices.currentIndex] = index;
    builder.mesh.addVertices(4, 12);
  }

  builder.vars.reset();
}

function addVertex(
  index: number,
  array: Float32Array,
  origin: Vector3Like,
  position: Vector3Like,
  normal: Vector3Like,
  uvs: Vector2Like,
  texture: number
) {
  index *= ItemMeshVertexConstants.VertexFloatSize;
  array[ItemMeshVertexConstants.PositionOffset + index] = position.x + origin.x;
  array[ItemMeshVertexConstants.PositionOffset + index + 1] =
    position.y + origin.y;
  array[ItemMeshVertexConstants.PositionOffset + index + 2] =
    position.z + origin.z;

  array[ItemMeshVertexConstants.UVOffset + index] = uvs.x;
  array[ItemMeshVertexConstants.UVOffset + index + 1] = uvs.y;

  array[ItemMeshVertexConstants.NormalOffset + index] = normal.x;
  array[ItemMeshVertexConstants.NormalOffset + index + 1] = normal.y;
  array[ItemMeshVertexConstants.NormalOffset + index + 2] = normal.z;

  array[ItemMeshVertexConstants.TextureIndexOffset + index] = texture;
}

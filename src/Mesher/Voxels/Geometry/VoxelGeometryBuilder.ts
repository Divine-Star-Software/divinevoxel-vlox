import { Vector3Like, Vector2Like, Vector4Like } from "@amodx/math";
import { VoxelShaderData } from "./VoxelShaderData";
import { VoxelModelBuilder } from "../Models/VoxelModelBuilder";

import { Quad } from "../../Geometry/Primitives/Quad";
import { QuadVertices } from "../../Geometry/Geometry.types";
import { VoxelMeshVertexConstants } from "./VoxelMeshVertexStructCursor";
import { Triangle } from "../../Geometry/Primitives";

const vector1ShaderData = Vector4Like.Create();
const vector2ShaderData = Vector4Like.Create();
const vector3ShaderData = Vector4Like.Create();
const vector4ShaderData = Vector4Like.Create();
export function addVoxelTriangle(builder: VoxelModelBuilder, tri: Triangle) {
  if (!builder.mesh) return;

  const origin = builder.origin;
  const worldLight = builder.vars.light;
  const worldAO = builder.vars.ao;
  const animData = builder.vars.animation;
  const texture = builder.vars.textureIndex;
  const overlayTextures = builder.vars.overlayTextures;
  const topRightPos = tri.positions.vertices[0];
  const topLeftPos = tri.positions.vertices[1];
  const bottomLeftPos = tri.positions.vertices[2];

  const topRightNor = tri.normals.vertices[0];
  const topLeftNor = tri.normals.vertices[1];
  const bottomLeftNor = tri.normals.vertices[2];

  const topRightVoxelData = VoxelShaderData.create(
    worldLight.vertices[QuadVertices.TopRight],
    worldLight.vertices[QuadVertices.TopLeft],
    worldLight.vertices[QuadVertices.BottomLeft],
    worldLight.vertices[QuadVertices.BottomRight],
    worldAO.vertices[QuadVertices.TopRight],
    worldAO.vertices[QuadVertices.TopLeft],
    worldAO.vertices[QuadVertices.BottomLeft],
    worldAO.vertices[QuadVertices.BottomRight],
    animData.vertices[QuadVertices.TopRight],
    QuadVertices.TopRight,
    vector1ShaderData,
  );
  const topLeftVoxelData = VoxelShaderData.create(
    worldLight.vertices[QuadVertices.TopRight],
    worldLight.vertices[QuadVertices.TopLeft],
    worldLight.vertices[QuadVertices.BottomLeft],
    worldLight.vertices[QuadVertices.BottomRight],
    worldAO.vertices[QuadVertices.TopRight],
    worldAO.vertices[QuadVertices.TopLeft],
    worldAO.vertices[QuadVertices.BottomLeft],
    worldAO.vertices[QuadVertices.BottomRight],
    animData.vertices[QuadVertices.TopLeft],
    QuadVertices.TopLeft,
    vector2ShaderData,
  );
  const bottomLeftVoxelData = VoxelShaderData.create(
    worldLight.vertices[QuadVertices.TopRight],
    worldLight.vertices[QuadVertices.TopLeft],
    worldLight.vertices[QuadVertices.BottomLeft],
    worldLight.vertices[QuadVertices.BottomRight],
    worldAO.vertices[QuadVertices.TopRight],
    worldAO.vertices[QuadVertices.TopLeft],
    worldAO.vertices[QuadVertices.BottomLeft],
    worldAO.vertices[QuadVertices.BottomRight],
    animData.vertices[QuadVertices.BottomLeft],
    QuadVertices.BottomLeft,
    vector3ShaderData,
  );

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
      builder.mesh.buffer.currentUint32Array,
      origin,
      topRightPos,
      topRightNor,
      tri.uvs.vertices[QuadVertices.TopRight],
      topRightVoxelData,
      texture,
      overlayTextures,
    );

    builder.mesh.buffer.setIndex(baseIndex + 1);
    addVertex(
      builder.mesh.buffer.currentIndex,
      builder.mesh.buffer.currentFloat32Array,
      builder.mesh.buffer.currentUint32Array,
      origin,
      topLeftPos,
      topLeftNor,
      tri.uvs.vertices[QuadVertices.TopLeft],
      topLeftVoxelData,
      texture,
      overlayTextures,
    );
    builder.mesh.buffer.setIndex(baseIndex + 2);
    addVertex(
      builder.mesh.buffer.currentIndex,
      builder.mesh.buffer.currentFloat32Array,
      builder.mesh.buffer.currentUint32Array,
      origin,
      bottomLeftPos,
      bottomLeftNor,
      tri.uvs.vertices[QuadVertices.BottomLeft],
      bottomLeftVoxelData,
      texture,
      overlayTextures,
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

export function addVoxelQuad(builder: VoxelModelBuilder, quad: Quad) {
  if (!builder.mesh) return;

  const origin = builder.origin;
  const worldLight = builder.vars.light;
  const worldAO = builder.vars.ao;
  const animData = builder.vars.animation;
  const texture = builder.vars.textureIndex;
  const overlayTextures = builder.vars.overlayTextures;
  const topRightPos = quad.positions.vertices[0];
  const topLeftPos = quad.positions.vertices[1];
  const bottomLeftPos = quad.positions.vertices[2];
  const bottomRightPos = quad.positions.vertices[3];
  const topRightNor = quad.normals.vertices[0];
  const topLeftNor = quad.normals.vertices[1];
  const bottomLeftNor = quad.normals.vertices[2];
  const bottomRightNor = quad.normals.vertices[3];
  const topRightVoxelData = VoxelShaderData.create(
    worldLight.vertices[QuadVertices.TopRight],
    worldLight.vertices[QuadVertices.TopLeft],
    worldLight.vertices[QuadVertices.BottomLeft],
    worldLight.vertices[QuadVertices.BottomRight],
    worldAO.vertices[QuadVertices.TopRight],
    worldAO.vertices[QuadVertices.TopLeft],
    worldAO.vertices[QuadVertices.BottomLeft],
    worldAO.vertices[QuadVertices.BottomRight],
    animData.vertices[QuadVertices.TopRight],
    QuadVertices.TopRight,
    vector1ShaderData,
  );
  const topLeftVoxelData = VoxelShaderData.create(
    worldLight.vertices[QuadVertices.TopRight],
    worldLight.vertices[QuadVertices.TopLeft],
    worldLight.vertices[QuadVertices.BottomLeft],
    worldLight.vertices[QuadVertices.BottomRight],
    worldAO.vertices[QuadVertices.TopRight],
    worldAO.vertices[QuadVertices.TopLeft],
    worldAO.vertices[QuadVertices.BottomLeft],
    worldAO.vertices[QuadVertices.BottomRight],
    animData.vertices[QuadVertices.TopLeft],
    QuadVertices.TopLeft,
    vector2ShaderData,
  );
  const bottomLeftVoxelData = VoxelShaderData.create(
    worldLight.vertices[QuadVertices.TopRight],
    worldLight.vertices[QuadVertices.TopLeft],
    worldLight.vertices[QuadVertices.BottomLeft],
    worldLight.vertices[QuadVertices.BottomRight],
    worldAO.vertices[QuadVertices.TopRight],
    worldAO.vertices[QuadVertices.TopLeft],
    worldAO.vertices[QuadVertices.BottomLeft],
    worldAO.vertices[QuadVertices.BottomRight],
    animData.vertices[QuadVertices.BottomLeft],
    QuadVertices.BottomLeft,
    vector3ShaderData,
  );
  const bottomRightVoxelData = VoxelShaderData.create(
    worldLight.vertices[QuadVertices.TopRight],
    worldLight.vertices[QuadVertices.TopLeft],
    worldLight.vertices[QuadVertices.BottomLeft],
    worldLight.vertices[QuadVertices.BottomRight],
    worldAO.vertices[QuadVertices.TopRight],
    worldAO.vertices[QuadVertices.TopLeft],
    worldAO.vertices[QuadVertices.BottomLeft],
    worldAO.vertices[QuadVertices.BottomRight],
    animData.vertices[QuadVertices.BottomRight],
    QuadVertices.BottomRight,
    vector4ShaderData,
  );
  const indices = builder.mesh!.indices;
  let indIndex = builder.mesh.indicesCount;

  const baseIndex = builder.mesh.vertexCount;
  builder.mesh.buffer.setIndex(baseIndex);
  addVertex(
    builder.mesh.buffer.currentIndex,
    builder.mesh.buffer.currentFloat32Array,
    builder.mesh.buffer.currentUint32Array,
    origin,
    topRightPos,
    topRightNor,
    quad.uvs.vertices[QuadVertices.TopRight],
    topRightVoxelData,
    texture,
    overlayTextures,
  );

  builder.mesh.buffer.setIndex(baseIndex + 1);
  addVertex(
    builder.mesh.buffer.currentIndex,
    builder.mesh.buffer.currentFloat32Array,
    builder.mesh.buffer.currentUint32Array,
    origin,
    topLeftPos,
    topLeftNor,
    quad.uvs.vertices[QuadVertices.TopLeft],
    topLeftVoxelData,
    texture,
    overlayTextures,
  );
  builder.mesh.buffer.setIndex(baseIndex + 2);
  addVertex(
    builder.mesh.buffer.currentIndex,
    builder.mesh.buffer.currentFloat32Array,
    builder.mesh.buffer.currentUint32Array,
    origin,
    bottomLeftPos,
    bottomLeftNor,
    quad.uvs.vertices[QuadVertices.BottomLeft],
    bottomLeftVoxelData,
    texture,
    overlayTextures,
  );
  builder.mesh.buffer.setIndex(baseIndex + 3);
  addVertex(
    builder.mesh.buffer.currentIndex,
    builder.mesh.buffer.currentFloat32Array,
    builder.mesh.buffer.currentUint32Array,
    origin,
    bottomRightPos,
    bottomRightNor,
    quad.uvs.vertices[QuadVertices.BottomRight],
    bottomRightVoxelData,
    texture,
    overlayTextures,
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
  float32Array: Float32Array,
  uint32Array: Uint32Array,
  origin: Vector3Like,
  position: Vector3Like,
  normal: Vector3Like,
  uvs: Vector2Like,
  voxelData: Vector4Like,
  texture: number,
  overlayTextures: Vector4Like,
) {
  index *= VoxelMeshVertexConstants.VertexFloatSize;
  float32Array[VoxelMeshVertexConstants.PositionOffset + index] =
    position.x + origin.x;
  float32Array[VoxelMeshVertexConstants.PositionOffset + index + 1] =
    position.y + origin.y;
  float32Array[VoxelMeshVertexConstants.PositionOffset + index + 2] =
    position.z + origin.z;

  float32Array[VoxelMeshVertexConstants.UVOffset + index] = uvs.x;
  float32Array[VoxelMeshVertexConstants.UVOffset + index + 1] = uvs.y;

  float32Array[VoxelMeshVertexConstants.NormalOffset + index] = normal.x;
  float32Array[VoxelMeshVertexConstants.NormalOffset + index + 1] = normal.y;
  float32Array[VoxelMeshVertexConstants.NormalOffset + index + 2] = normal.z;

  uint32Array[VoxelMeshVertexConstants.TextureIndexOffset + index] =
    VoxelShaderData.createTextureIndex(texture, overlayTextures.x);
  uint32Array[VoxelMeshVertexConstants.TextureIndexOffset + index + 1] =
    VoxelShaderData.createTextureIndex(overlayTextures.y, overlayTextures.z);
  uint32Array[VoxelMeshVertexConstants.TextureIndexOffset + index + 2] =
    VoxelShaderData.createTextureIndex(overlayTextures.w, 0);

  uint32Array[VoxelMeshVertexConstants.VoxelDataOFfset + index] = voxelData.x;
  uint32Array[VoxelMeshVertexConstants.VoxelDataOFfset + index + 1] =
    voxelData.y;
  uint32Array[VoxelMeshVertexConstants.VoxelDataOFfset + index + 2] =
    voxelData.z;
  uint32Array[VoxelMeshVertexConstants.VoxelDataOFfset + index + 3] =
    voxelData.w;
}

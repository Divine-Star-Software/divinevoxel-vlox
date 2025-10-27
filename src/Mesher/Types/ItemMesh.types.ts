export class ItemMeshTypes {
  static vertexStrideBytes = 96;
  static vertexStrideFloats = 24;

  static VoxelMeshStructWGSL = /* wgsl */ `
  struct ItemMeshVertex {
    position: vec3f, 
    normal: vec3f,     
    uv: vec2f,    
    textureIndex: f32,    
  };
      `;
}

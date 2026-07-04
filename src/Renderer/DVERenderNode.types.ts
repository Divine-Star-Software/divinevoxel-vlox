export type NodeMaterialData = {
  id: string;
  textureTypeId?: string;
  shaderId: string;
} & NodeMaterialOptions;

export type NodeMaterialOptions = {
  alphaTesting: boolean;
  alphaBlending: boolean;
  mipMapBias?: number;
  hasEffects?: boolean;
  backFaceCulling?: boolean;
  forceDepthWrite?: boolean;
};

export type NodeSubstanceData = {
  id: string;
  shader: string;
  // texture: TextureType;
  material: NodeMaterialOptions;
};

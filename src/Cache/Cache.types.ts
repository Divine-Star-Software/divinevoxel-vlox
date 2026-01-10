import { CompactMeshData } from "../Mesher/Types/Mesher.types";
import { TextureData } from "../Textures/Texture.types";


export interface CachedDisplayIndex {
  textures: Record<string, Record<string, string>>;
  meshes: Record<string, Record<string, {model:CompactMeshData;material:string}>>;
}

export interface CacheData {
  textures: TextureData[];
  displayIndex: CachedDisplayIndex;
}

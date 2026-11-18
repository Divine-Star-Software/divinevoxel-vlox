import { Vec2Array, Vector3Like } from "@amodx/math";
export interface MesherSettingsData {}
export class MesherSettingsData {
  /**Tell the mesher to shade voxel faces with sun light data. Disable if you are using a custom rendering pipeline. */
  doSunLight = true;
  /**Tell the mesher to use the built in AO system. Disable if you are using a custom rendering pipeline. */
  doAO = true;
  doColors = true;
  /**Send each section's voxel BVH (tree + per voxel index ranges) along with the mesh data.
   * Needed for ray traced rendering pipelines. Adds ~290KB per meshed section, so leave off unless used. */
  buildBVH = false;
  /**Send each meshed section's voxel light (sun + rgb, 8KB) along with the mesh data.
   * Lets renderers use the light field directly, e.g. volumetric light. */
  sendLightData = false;
}
export interface RenderSettingsData {}
export class RenderSettingsData {
  /**Set the mode to change how mesh data is generated based on the underlying rendering API. */
  mode: "webgl" | "webgpu" = "webgl";
  /**Renderer will not dispose of buffers to keep them rendering. */
  cpuBound = false;
  /* Single buffer mode will store vertex and indices in single big buffer. While multi will store a buffer for each section mesh.*/
  bufferMode: "single" | "multi" = "multi";
  textureSize: Vec2Array = [16, 16];
  /**
   * Milliseconds per frame the main thread may spend applying finished section
   * meshes. The rest wait for the next frame, so a burst of meshes (e.g. when
   * the player crosses into new terrain) can't cause one long frame.
   * 0 applies everything as soon as it arrives.
   */
  meshUploadBudgetMs = 4;
}
export interface UpdatingSettings {}
export class UpdatingSettings {
  /**Sector sections are marked as dirty so they can be processed later. */
  dirtyMechanism = true;
  /**Updated sector sections are auto rebuilt */
  autoRebuild = false;
}
export interface WorldSettings {}
export class WorldSettings {
  min = Vector3Like.Create(
    -Number.MAX_SAFE_INTEGER,
    0,
    -Number.MAX_SAFE_INTEGER
  );
  max = Vector3Like.Create(
    Number.MAX_SAFE_INTEGER,
    256,
    Number.MAX_SAFE_INTEGER
  );
  sectorPower2Size = Vector3Like.Create(4, 8, 4);
  sectionPower2Size = Vector3Like.Create(4, 4, 4);
}

export interface PropagationSettings {}
export class PropagationSettings {
  rgbLightEnabled = true;
  sunLightEnabled = true;
  flowEnabled = true;
  powerEnabled = true;
}

export interface MemoryAndCPUSettings {}
export class MemoryAndCPUSettings {
  useSharedMemory = true;
}

export class EngineSettingsData {
  memoryAndCPU = new MemoryAndCPUSettings();
  mesher = new MesherSettingsData();
  rendererSettings = new RenderSettingsData();
  updating = new UpdatingSettings();
  world = new WorldSettings();
  propagation = new PropagationSettings();
}

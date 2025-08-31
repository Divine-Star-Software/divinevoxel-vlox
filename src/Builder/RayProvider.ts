import { Vector3Like } from "@amodx/math";

export interface RayProvider {
  origin: Vector3Like;
  direction: Vector3Like;
  length: number;
}

import { Vec3Array, Vector3Like } from "@amodx/math";

export function CubeHashVec3Array(
  positionX: number,
  positionY: number,
  positionZ: number,
  xPower2: number,
  yPower2: number,
  zPower2: number,
  positionRef: Vec3Array = [0, 0, 0]
) {
  positionRef[0] = (positionX >> xPower2) << xPower2;
  positionRef[1] = (positionY >> yPower2) << yPower2;
  positionRef[2] = (positionZ >> zPower2) << zPower2;
  return positionRef;
}
export function CubeHashVec3(
  positionX: number,
  positionY: number,
  positionZ: number,
  xPower2: number,
  yPower2: number,
  zPower2: number,
  positionRef = Vector3Like.Create()
) {
  positionRef.x = (positionX >> xPower2) << xPower2;
  positionRef.y = (positionY >> yPower2) << yPower2;
  positionRef.z = (positionZ >> zPower2) << zPower2;
  return positionRef;
}

export function GetYXZOrderArrayIndex(
  x: number,
  y: number,
  z: number,
  zPower: number,    // log2(boundsZ)
  xzPower: number    // log2(boundsX * boundsZ), precomputed
): number {
  return z | (x << zPower) | (y << xzPower);
}

export function GetYXZOrderArrayPositionVec3(
  index: number,
  zPower: number,
  xzPower: number,
  zMask: number,     // boundsZ - 1
  xMask: number,     // boundsX - 1
  positionRef= Vector3Like.Create()
): Vector3Like {
  positionRef.z = index & zMask;
  positionRef.x = (index >> zPower) & xMask;
  positionRef.y = index >> xzPower;
  return positionRef;
}

export function GetYXZOrderArrayPositionVec3Array(
  index: number,
  zPower: number,
  xzPower: number,
  zMask: number,     // boundsZ - 1
  xMask: number,     // boundsX - 1
  positionRef: Vec3Array = [0, 0, 0]
): Vec3Array {
  positionRef[2] = index & zMask;
  positionRef[0] = (index >> zPower) & xMask;
  positionRef[1] = index >> xzPower;
  return positionRef;
}
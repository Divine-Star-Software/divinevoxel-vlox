import {
  AOOcclusionFaceIndex,
  AOOcclusionFaceIndexData,
} from "../Geomtry/AOOcclusionFaceIndex";
import { CompiledGeomtryNodes } from "./../../Mesher/Voxels/Models/Nodes/Types/GeomtryNode.types";
import {
  CulledOcclusionFaceIndex,
  CulledOcclusionFaceIndexData,
} from "../Geomtry/CulledOcclusionFaceIndex";
import { CullingProcedureData } from "../Geomtry/VoxelGeomtry.types";

export type GeomtryLUTExport = {
  geomtryIndex: number[][];
  geomtryInputsIndex: number[][];
  geomtryInputs: any[][];
  compiledGeomtry: CompiledGeomtryNodes[][];
  rulelessIndex: boolean[];
  geomtryCullingProceduresIndex: number[];
  geomtryCullingProcedures: CullingProcedureData[];
  faceCullIndex: CulledOcclusionFaceIndexData;
  aoIndex: AOOcclusionFaceIndexData;
  faceCullMap: number[][];
  aoVertexHitMap: number[][][];
};

export class GeomtryLUT {
  //map of geomtry indexes to the geomtry node id array
  static geomtryIndex: number[][] = [];
  //map of geomtry indexes to the geomtry node input array
  static geomtryInputsIndex: number[][] = [];
  //final map of the geomtry input index to their inputs
  static geomtryInputs: any[][] = [];
  //final map of geo ids to their compiled geomtry nodes
  static compiledGeomtry: CompiledGeomtryNodes[][] = [];
  //maps geomtry ids to wether it is ruleless
  static rulelessIndex: boolean[] = [];
  //maps geomtry node indexes to their culling procedure index
  static geomtryCullingProceduresIndex: number[] = [];
  //record of culling procedures
  static geomtryCullingProcedures: CullingProcedureData[] = [];
  static faceCullIndex: CulledOcclusionFaceIndex;
  static aoIndex: AOOcclusionFaceIndex;
  static faceCullMap: number[][] = [];
  static aoVertexHitMap: number[][][] = [];

  static export(): GeomtryLUTExport {
    return {
      geomtryIndex: this.geomtryIndex,
      geomtryInputsIndex: this.geomtryInputsIndex,
      geomtryInputs: this.geomtryInputs,
      compiledGeomtry: this.compiledGeomtry,
      rulelessIndex: this.rulelessIndex,
      geomtryCullingProceduresIndex: this.geomtryCullingProceduresIndex,
      geomtryCullingProcedures: this.geomtryCullingProcedures,
      faceCullIndex: this.faceCullIndex.toJSON(),
      aoIndex: this.aoIndex.toJSON(),
      faceCullMap: this.faceCullMap,
      aoVertexHitMap: this.aoVertexHitMap,
    };
  }
  static import(exported: GeomtryLUTExport) {
    this.geomtryIndex = exported.geomtryIndex;
    this.geomtryInputsIndex = exported.geomtryInputsIndex;
    this.geomtryInputs = exported.geomtryInputs;
    this.compiledGeomtry = exported.compiledGeomtry;
    this.rulelessIndex = exported.rulelessIndex;
    this.geomtryCullingProceduresIndex = exported.geomtryCullingProceduresIndex;
    this.geomtryCullingProcedures = exported.geomtryCullingProcedures;
    this.faceCullIndex = new CulledOcclusionFaceIndex(exported.faceCullIndex);
    this.aoIndex = new AOOcclusionFaceIndex(exported.aoIndex);
    this.faceCullMap = exported.faceCullMap;
    this.aoVertexHitMap = exported.aoVertexHitMap;
  }
}

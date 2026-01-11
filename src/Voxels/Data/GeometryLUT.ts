import {
  AOOcclusionFaceIndex,
  AOOcclusionFaceIndexData,
} from "../Geometry/AOOcclusionFaceIndex";
import { CompiledGeometryNodes } from "../../Mesher/Voxels/Models/Nodes/Types/GeometryNode.types";
import {
  CulledOcclusionFaceIndex,
  CulledOcclusionFaceIndexData,
} from "../Geometry/CulledOcclusionFaceIndex";
import { CullingProcedureData } from "../Geometry/VoxelGeometry.types";

export type GeometryLUTExport = {
  geometryIndex: number[][];
  geometryInputsIndex: number[][];
  geometryInputs: any[][];
  compiledGeometry: CompiledGeometryNodes[][];
  rulelessIndex: boolean[];
  geometryCullingProceduresIndex: number[];
  geometryCullingProcedures: CullingProcedureData[];
  faceCullIndex: CulledOcclusionFaceIndexData;
  aoIndex: AOOcclusionFaceIndexData;
  faceCullMap: number[][];
  aoVertexHitMap: number[][][];
};

export class GeometryLUT {
  //map of geometry indexes to the geometry node id array
  static geometryIndex: number[][] = [];
  //map of geometry indexes to the geometry node input array
  static geometryInputsIndex: number[][] = [];
  //final map of the geometry input index to their inputs
  static geometryInputs: any[][] = [];
  //final map of geo ids to their compiled geometry nodes
  static compiledGeometry: CompiledGeometryNodes[][] = [];
  //maps geometry ids to wether it is ruleless
  static rulelessIndex: boolean[] = [];
  //maps geometry node indexes to their culling procedure index
  static geometryCullingProceduresIndex: number[] = [];
  //record of culling procedures
  static geometryCullingProcedures: CullingProcedureData[] = [];
  static faceCullIndex: CulledOcclusionFaceIndex;
  static aoIndex: AOOcclusionFaceIndex;
  static faceCullMap: number[][] = [];
  static aoVertexHitMap: number[][][] = [];

  static export(): GeometryLUTExport {
    return {
      geometryIndex: this.geometryIndex,
      geometryInputsIndex: this.geometryInputsIndex,
      geometryInputs: this.geometryInputs,
      compiledGeometry: this.compiledGeometry,
      rulelessIndex: this.rulelessIndex,
      geometryCullingProceduresIndex: this.geometryCullingProceduresIndex,
      geometryCullingProcedures: this.geometryCullingProcedures,
      faceCullIndex: this.faceCullIndex.toJSON(),
      aoIndex: this.aoIndex.toJSON(),
      faceCullMap: this.faceCullMap,
      aoVertexHitMap: this.aoVertexHitMap,
    };
  }
  static import(exported: GeometryLUTExport) {
    this.geometryIndex = exported.geometryIndex;
    this.geometryInputsIndex = exported.geometryInputsIndex;
    this.geometryInputs = exported.geometryInputs;
    this.compiledGeometry = exported.compiledGeometry;
    this.rulelessIndex = exported.rulelessIndex;
    this.geometryCullingProceduresIndex = exported.geometryCullingProceduresIndex;
    this.geometryCullingProcedures = exported.geometryCullingProcedures;
    this.faceCullIndex = new CulledOcclusionFaceIndex(exported.faceCullIndex);
    this.aoIndex = new AOOcclusionFaceIndex(exported.aoIndex);
    this.faceCullMap = exported.faceCullMap;
    this.aoVertexHitMap = exported.aoVertexHitMap;
  }
}

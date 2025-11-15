import { ArchivedVoxelTemplate } from "./Archive/ArchivedVoxelTemplate";
import { FullVoxelTemplate } from "./Full/FullVoxelTemplate";
import { VoxelBFSSelection } from "./Selection/VoxelBFSSelection";
import { VoxelBoundsSelection } from "./Selection/VoxelBoundsSelection";
import { VoxelPointSelection } from "./Selection/VoxelPointSelection";
import {
  IVoxelSelection,
  IVoxelSelectionConstructor,
  IVoxelSelectionData,
} from "./Selection/VoxelSelection";
import { VoxelSurfaceSelection } from "./Selection/VoxelSurfaceSelection";
import { VoxelTemplateSelection } from "./Selection/VoxelTemplateSelection";
import { BoxVoxelShapeSelection } from "./Shapes/Selections/BoxVoxelShapeSelection";
import { ConeVoxelShapeSelection } from "./Shapes/Selections/ConeVoxelShapeSelection";
import { CylinderVoxelShapeSelection } from "./Shapes/Selections/CylinderVoxelShapeSelection";
import { OctahedronVoxelShapeSelection } from "./Shapes/Selections/OctahedronVoxelShapeSelection";
import { PyramidVoxelShapeSelection } from "./Shapes/Selections/PyramidVoxelShapeSelection";
import { SphereVoxelShapeSelection } from "./Shapes/Selections/SphereVoxelShapeSelection";
import { EllipsoidVoxelShapeSelection } from "./Shapes/Selections/EllipsoidVoxelShapeSelection";
import { TorusVoxelShapeSelection } from "./Shapes/Selections/TorusVoxelShapeSelection";
import { VoxelShapeTemplate } from "./Shapes/VoxelShapeTemplate";
import {
  IVoxelTemplate,
  IVoxelTemplateConstructor,
  IVoxelTemplateData,
} from "./VoxelTemplates.types";

export class VoxelTemplateRegister {
  static _templates = new Map<string, IVoxelTemplateConstructor<any>>();
  static _selections = new Map<string, IVoxelSelectionConstructor<any>>();

  static register(id: string, constructor: IVoxelTemplateConstructor<any>) {
    this._templates.set(id, constructor);
  }

  static create<Template extends IVoxelTemplate>(
    data: IVoxelTemplateData<any>
  ): Template {
    const TemplateClass = this._templates.get(data.type)!;
    if (!TemplateClass)
      throw new Error(
        `Voxel template with type id [${data.type}] does not exist`
      );
    return new TemplateClass(data) as Template;
  }

  static registerSelection(
    id: string,
    constructor: IVoxelSelectionConstructor<any>
  ) {
    this._selections.set(id, constructor);
  }

  static createSelection<Selection extends IVoxelSelection>(
    data: IVoxelSelectionData<any>
  ): Selection {
    const SelectionClass = this._selections.get(data.type)!;
    if (!SelectionClass)
      throw new Error(
        `Voxel template with type id [${data.type}] does not exist`
      );
    const selection = new SelectionClass() as Selection;
    selection.fromJSON(data);
    return selection;
  }
}
//templates
VoxelTemplateRegister.register("full", FullVoxelTemplate);
VoxelTemplateRegister.register("archived", ArchivedVoxelTemplate);
VoxelTemplateRegister.register("shape", VoxelShapeTemplate);
VoxelShapeTemplate.Register = VoxelTemplateRegister;
//selections
VoxelTemplateRegister.registerSelection("point", VoxelPointSelection);
VoxelTemplateRegister.registerSelection("bounds", VoxelBoundsSelection);
VoxelTemplateRegister.registerSelection("bfs", VoxelBFSSelection);
VoxelTemplateRegister.registerSelection("surface", VoxelSurfaceSelection);
VoxelTemplateRegister.registerSelection("template", VoxelTemplateSelection);
VoxelTemplateSelection.Register = VoxelTemplateRegister;
VoxelTemplateRegister.registerSelection("box-shape", BoxVoxelShapeSelection);
VoxelTemplateRegister.registerSelection(
  "sphere-shape",
  SphereVoxelShapeSelection
);
VoxelTemplateRegister.registerSelection(
  "ellipsoid-shape",
  EllipsoidVoxelShapeSelection
);
VoxelTemplateRegister.registerSelection(
  "pyramid-shape",
  PyramidVoxelShapeSelection
);
VoxelTemplateRegister.registerSelection(
  "cylinder-shape",
  CylinderVoxelShapeSelection
);
VoxelTemplateRegister.registerSelection("cone-shape", ConeVoxelShapeSelection);
VoxelTemplateRegister.registerSelection(
  "octahedron-shape",
  OctahedronVoxelShapeSelection
);
VoxelTemplateRegister.registerSelection(
  "torus-shape",
  TorusVoxelShapeSelection
);

import { VoxelPickResult } from "Voxels/Interaction/VoxelPickResult";
import { TypedEventTarget } from "../../Util/TypedEventTarget";
import { VoxelBuildSpace } from "../VoxelBuildSpace";

type ToolOptionBase<Data> = {
  cateogry: string;
  property: string;
  name: string;
} & Data;

export type ToolOption =
  | ToolOptionBase<{
      type: "string";
      options: [name: string, value: any][];
    }>
  | ToolOptionBase<{
      type: "number";
      min: number;
      max: number;
    }>;

export type ToolOptionsData = ToolOption[];
export abstract class BuilderToolBase<
  Events extends Record<string, any>
> extends TypedEventTarget<Events> {
  rayProviderIndex = 0;
  protected _lastPicked: VoxelPickResult | null = null;
  get picked(): Readonly<VoxelPickResult> | null {
    return this._lastPicked;
  }

  constructor(public space: VoxelBuildSpace) {
    super();
  }

  protected _options: ToolOptionsData = [];
  protected _optionsMap = new Map<string, ToolOption>();
  protected _categoryMap = new Map<string, Set<string>>();

  protected processOptions(data: ToolOptionsData) {
    this._options = data;
    this._optionsMap.clear();
    this._categoryMap.clear();

    for (const option of data) {
      let categoryArray = this._categoryMap.get(option.cateogry);
      if (!categoryArray) {
        categoryArray = new Set();
        this._categoryMap.set(option.cateogry, categoryArray);
      }

      categoryArray.add(option.property);
      this._optionsMap.set(option.property, option);
    }
  }

  getOptions() {
    return this._options;
  }

  getOptionCategories() {
    return [...this._categoryMap];
  }

  abstract getOptionValue(id: string): any;
  getOptionData(id: string) {
    return this._optionsMap.get(id);
  }

  optionInCategory(option: string, cateogry: string) {
    return Boolean(this._categoryMap.get(cateogry)?.has(option));
  }

  abstract getCurrentOptions(): ToolOptionsData;
  abstract updateOption(property: string, value: any): void;

  abstract use(...args: any): Promise<void>;
  abstract update(...args: any): Promise<void>;
}

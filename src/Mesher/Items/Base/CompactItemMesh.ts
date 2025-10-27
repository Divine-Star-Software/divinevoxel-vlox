import { CompactMeshData } from "../../Types/Mesher.types";
import { ItemModelBuilder } from "../Models/ItemModelBuilder";

export function CompactItemMesh(
  tools: ItemModelBuilder[],
  transfers: any[] = []
): CompactMeshData {
  const data: CompactMeshData = [];
  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    if (!tool.mesh!.vertexCount) continue;

    const { vertexArray, indiciesArray } = tool.mesh.create();

    const minBounds = tool.mesh.minBounds;
    const maxBounds = tool.mesh.maxBounds;

    data.push([
      tool.id,
      vertexArray,
      indiciesArray,
      [minBounds.x, minBounds.y, minBounds.z],
      [maxBounds.x, maxBounds.y, maxBounds.z],
    ]);
    transfers.push(vertexArray.buffer, indiciesArray.buffer);
  }

  return data;
}

import { VoxelModelBuilder } from "./VoxelModelBuilder";
import { VoxelModelConstructorRegister } from "./VoxelModelConstructorRegister";
import { VoxelLUT } from "../../../Voxels/Data/VoxelLUT";
import { GeomtryLUT } from "../../../Voxels/Data/GeomtryLUT";

export class VoxelConstructor {
  isModel: true = true;

  // effects: VoxelModelEffect;

  constructor(public id: string, public builder: VoxelModelBuilder) {
    //  this.effects = new VoxelModelEffect(this);
  }

  process(): boolean {
    let added = false;
    const builder = this.builder;
    const hashed = builder.space.getHash(
      builder.nVoxel,
      builder.position.x,
      builder.position.y,
      builder.position.z
    );

    const trueVoxelId = builder.voxel.getVoxelId();
    const voxelId = builder.space!.voxelCache[hashed];
    const reltionalVoxelId = builder.space!.reltionalVoxelCache[hashed];

    const geomtriesIndex = VoxelLUT.getGeomtryIndex(voxelId, reltionalVoxelId);
    const geomtries = GeomtryLUT.geomtryIndex[geomtriesIndex];

    const inputsIndex = VoxelLUT.getGeomtryInputIndex(
      voxelId,
      reltionalVoxelId
    );
    const inputs = GeomtryLUT.geomtryInputsIndex[inputsIndex];

    const geometriesLength = geomtries.length;

    for (let i = 0; i < geometriesLength; i++) {
      const nodeId = geomtries[i];
      const inputsIndex = inputs[i];
      const geoInputs = GeomtryLUT.geomtryInputs[inputsIndex];
      const geomtry = VoxelModelConstructorRegister.geometry[nodeId];
      const nodesLength = geomtry.nodes.length;
      for (let k = 0; k < nodesLength; k++) {
        const geo = geomtry.nodes[k];
        geo.builder = this.builder;
        const addedGeo = geo.add(geoInputs[k]);
        if (addedGeo) added = true;
      }
    }

    const conditioanlNodes = VoxelLUT.getConditionalGeomtryNodes(trueVoxelId);
    if (conditioanlNodes) {
      const modelState = VoxelLUT.voxelIdToModelState[voxelId];
      const reltionalState = builder.space!.reltionalStateCache[hashed];
      const nodesLength = conditioanlNodes.length;

      for (let i = 0; i < nodesLength; i++) {
        const [geoId, requiredModelState, requiredModelReltionalState] =
          conditioanlNodes[i];
        if (
          requiredModelState !== modelState ||
          !requiredModelReltionalState[reltionalState]
        )
          continue;

        const geomtries = GeomtryLUT.geomtryIndex[geoId];
        const inputsIndex = VoxelLUT.getConditionalGeomtryInputIndex(
          geoId,
          voxelId,
          reltionalVoxelId
        );

        const inputs = GeomtryLUT.geomtryInputsIndex[inputsIndex];

        const geometriesLength = geomtries.length;

        for (let i = 0; i < geometriesLength; i++) {
          const nodeId = geomtries[i];
          const inputsIndex = inputs[i];
          const geoInputs = GeomtryLUT.geomtryInputs[inputsIndex];
          const geomtry = VoxelModelConstructorRegister.geometry[nodeId];
          const nodesLength = geomtry.nodes.length;
          for (let k = 0; k < nodesLength; k++) {
            const geo = geomtry.nodes[k];
            geo.builder = this.builder;
            const addedGeo = geo.add(geoInputs[k]);
            if (addedGeo) added = true;
          }
        }
      }
    }

    /*     this.effects.addEffects(
      builder.voxel.getState(),
      builder.origin,
      builder.effects
    ); */

    builder.clearCalculatedData();

    return added;
  }
}

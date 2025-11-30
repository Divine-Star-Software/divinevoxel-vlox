import { CardinalNeighbors2D, CardinalNeighbors3D } from "../../../../Math/CardinalNeighbors";
import { VoxelBehaviorsRegister } from "../VoxelBehaviorsRegister";

VoxelBehaviorsRegister.register({
  type: "dve_liquid",
  needUpdate(simulation, voxel, x, y, z) {
    let scheduleUpdate = false;
   for (let i = 0; i < CardinalNeighbors2D.length; i++) {
      const nx = CardinalNeighbors2D[i][0] + x;
      const nz = CardinalNeighbors2D[i][1] + z;
      const nVoxel = simulation.nDataCursor.getVoxel(nx, y, nz);
      if (nVoxel &&  !nVoxel.isSameVoxel(voxel) && nVoxel.isAir()) {
        scheduleUpdate = true;
        break;
      }
    }  
    const downVoxel = simulation.nDataCursor.getVoxel(x, y - 1, z);
    if (downVoxel && !downVoxel.isSameVoxel(voxel) && downVoxel.isAir()) {
      scheduleUpdate = true;
    }
    if (scheduleUpdate) {
        simulation.scheduleUpdate("dve_liquid", x, y, z, 0);
    }
    return scheduleUpdate;
  },
  onPaint(simulation, voxel, x, y, z) {
    simulation.scheduleUpdate("dve_liquid", x, y, z, 0);
  },
  onErase(simulation, voxel, x, y, z) {
    voxel.setLevelState(2);
    for (let i = 0; i < CardinalNeighbors3D.length; i++) {
      const nx = CardinalNeighbors3D[i][0] + x;
      const ny = CardinalNeighbors3D[i][1] + y;
      const nz = CardinalNeighbors3D[i][2] + z;
      const nVoxel = simulation.sDataCursor.getVoxel(nx, ny, nz);
      if (!nVoxel || !nVoxel.substanceTags["dve_is_liquid"]) continue;
      simulation.scheduleUpdate("dve_liquid", nx, ny, nz, 0);
    }
    simulation.scheduleUpdate("dve_liquid", x, y, z, 10);
  },
});

import { Threads } from "@amodx/threads/";
import { ThreadManager } from "../Base/ThreadManager";
const world = Threads.createThread("world");
export class MesherThreadsManager extends ThreadManager {
  static instance: MesherThreadsManager;
  parent = Threads.parent;
  world = world;

  constructor() {
    super();
    MesherThreadsManager.instance = this;
    this.addThread(this.world);
    this.addThread(this.parent);
  }
}

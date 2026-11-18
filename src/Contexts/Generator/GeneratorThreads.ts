import { Threads } from "@amodx/threads/";
import { ThreadManager } from "../Base/ThreadManager";
const world = Threads.createThread("world");
export class GeneratorThreadsManager extends ThreadManager {
  static instance: GeneratorThreadsManager;
  parent = Threads.parent;
  world = world;

  constructor() {
    super();
    GeneratorThreadsManager.instance = this;
    this.addThread(this.world);
    this.addThread(this.parent);
  }
}

import type { EngineHandle } from "../types";

export function initializeWasm(rpcUrl: string): Promise<EngineHandle>;
export function getHandle(): EngineHandle;

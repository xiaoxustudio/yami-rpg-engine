export interface ToolInstance {
	open?: (...args: unknown[]) => void;
	close?: () => void;
	initialize?: (...args: unknown[]) => void;
}

type ToolRegistryShape = {
	registerTool(name: string, instance: ToolInstance): void;
	getToolInstance(name: string): ToolInstance | undefined;
};

let registry: ToolRegistryShape | null = null;
const fallbackRegistry = new Map<string, ToolInstance>();

export function bindToolRegistry(bridge: ToolRegistryShape): void {
	registry = bridge;
}

export function registerTool(name: string, instance: ToolInstance): void {
	if (registry) {
		registry.registerTool(name, instance);
		return;
	}
	fallbackRegistry.set(name, instance);
}

export function getToolInstance(name: string): ToolInstance | undefined {
	return registry?.getToolInstance(name) ?? fallbackRegistry.get(name);
}

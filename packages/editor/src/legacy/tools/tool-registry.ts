export interface ToolInstance {
	open?: (...args: unknown[]) => void;
	close?: () => void;
	initialize?: (...args: unknown[]) => void;
}

const toolRegistry = new Map<string, ToolInstance>();

export function registerTool(name: string, instance: ToolInstance): void {
	toolRegistry.set(name, instance);
}

export function getToolInstance(name: string): ToolInstance | undefined {
	return toolRegistry.get(name);
}

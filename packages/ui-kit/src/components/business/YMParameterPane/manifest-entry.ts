import type { ParamDef } from './param-pane-core';

export interface ManifestEntry {
	parameters: ParamDef[] | null;
	langMap: {
		active: string;
		update(): { active: string; get(key: string | undefined): string };
	};
	manager: { states: Record<string, unknown> };
	overview?: { deprecated?: string };
}

import type { DataEntryShape } from '@app/stores/data';

export interface UpdaterHooks {
	getProjectPath: () => string | null;
	getProject: () => Record<string, unknown> | null;
	getLocalEvents: () => Record<string, unknown[]>;
	createInspectorSchema: (type: string, arg?: string) => DataEntryShape;
	getUiInspectorType: (className: string) => string;
	getLanguage: () => string;
	openUpdateLog: (messages?: unknown[]) => void;
}

interface UpdaterShape {
	latestEditorVersion: string;
	latestProjectVersion: string;
	getTSVersionWarning: (() => { message: string; confirm: string; cancel: string }) | null;
	updateProject: ((verNum: number) => void) | null;
	updateConfig: ((verNum: number) => void) | null;
	updateLocalEvents: ((verNum: number) => void) | null;
	updateGlobalEvents: ((verNum: number) => void) | null;
	updateGlobalEvent: (meta: unknown) => void;
	updateActors: ((verNum: number) => void) | null;
	updateSkills: ((verNum: number) => void) | null;
	updateTriggers: ((verNum: number) => void) | null;
	updateItems: ((verNum: number) => void) | null;
	updateEquipments: ((verNum: number) => void) | null;
	updateStates: ((verNum: number) => void) | null;
	updateScenes: ((verNum: number) => void) | null;
	updateTilesets: ((verNum: number) => void) | null;
	updateElements: ((verNum: number) => void) | null;
	updateAnimations: ((verNum: number) => void) | null;
	updateParticles: ((verNum: number) => void) | null;
	updateTeams: ((verNum: number) => void) | null;
	createLocalization: ((verNum: number) => Promise<void>) | null;
	backupProject: (() => void) | null;
	updateToLatest: ((version: string) => unknown) | null;
	updateIncrementalChanges: (version: string) => unknown;
	getVersionNumber: ((version: string) => number) | null;
	hooks: UpdaterHooks;
}

export const Updater = {
	latestEditorVersion: '1.0.18',
	latestProjectVersion: '1.0.147',
	// runtime 挂载: version-warning.ts 中挂载 TS 版本警告函数
	getTSVersionWarning: null,
	updateProject: null,
	updateConfig: null,
	updateLocalEvents: null,
	updateGlobalEvents: null,
	updateActors: null,
	updateSkills: null,
	updateTriggers: null,
	updateItems: null,
	updateEquipments: null,
	updateStates: null,
	updateScenes: null,
	updateTilesets: null,
	updateElements: null,
	updateAnimations: null,
	updateParticles: null,
	updateTeams: null,
	createLocalization: null,
	backupProject: null,
	updateToLatest: null,
	getVersionNumber: null
} satisfies Partial<UpdaterShape> as UpdaterShape;

export function setUpdaterHooks(hooks: UpdaterHooks) {
	Updater.hooks = hooks;
}

Updater.getVersionNumber = function (version: string) {
	if (!version) return 0;
	const nodes = version.split('.');
	const a = parseInt(nodes[0]);
	const b = parseInt(nodes[1]);
	const c = parseInt(nodes[2]);
	return a * 100000000 + b * 10000 + c;
};

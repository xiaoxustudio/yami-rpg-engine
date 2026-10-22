import type { DataEntryShape } from '@app/stores/data';
// ⚠️ 必须是**具名导入**，不要写 `import editorPackage from '…/package.json'`：
// 默认导入在 vitest 下正常，但在**生产构建**里会出问题 —— rolldown 的 JSON 插件会把整份
// package.json（含 devDependencies、scripts）内联进渲染层包，且 `editorPackage.version`
// 会退化成**整个对象**（实测 main.js 里出现 `latestEditorVersion:{name:"@yami/editor",…}`，
// 首页会显示成 [object Object]，包体 738 KB）。具名导入会被 tree-shake 成单个字符串（735 KB）。
import { version as editorVersion } from '../../../package.json';

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
	// 编辑器版本**只有一个真源**：`packages/editor/package.json` 的 `version`
	// （electron-builder 用它命名安装包；发布时由 `scripts/release-sync-version.mjs` 按 tag 改写）。
	// 这里刻意不写字面量 —— 这个值会被写进用户的 `config.json` 当作**迁移纪元**
	// （见 `services/project/version.ts` 的 `checkForEditorUpdates`），
	// 一旦与 package.json 分叉，就会出现"安装包是 1.0.19、界面显示 1.0.18"这种双版本。
	// `__tests__/version.spec.ts` 会从磁盘独立读 package.json 来守住这一点。
	// 注意 `latestProjectVersion` 是**项目数据 schema 的纪元**，与编辑器版本无关，故仍是字面量。
	latestEditorVersion: editorVersion,
	latestProjectVersion: '1.0.147',
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

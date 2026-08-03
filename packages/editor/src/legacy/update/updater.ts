export const Updater = {
	latestEditorVersion: '1.0.18',
	latestProjectVersion: '1.0.147',
	// runtime 挂载: version-warning.ts 中挂载 TS 版本警告函数
	getTSVersionWarning: null as
		| (() => { message: string; confirm: string; cancel: string })
		| null,
	updateProject: null as any,
	updateConfig: null as any,
	updateLocalEvents: null as any,
	updateGlobalEvents: null as any,
	updateGlobalEvent: null as any,
	updateActors: null as any,
	updateSkills: null as any,
	updateTriggers: null as any,
	updateItems: null as any,
	updateEquipments: null as any,
	updateStates: null as any,
	updateScenes: null as any,
	updateTilesets: null as any,
	updateElements: null as any,
	updateAnimations: null as any,
	updateParticles: null as any,
	updateTeams: null as any,
	createLocalization: null as any,
	backupProject: null as any,
	updateToLatest: null as any,
	updateIncrementalChanges: null as any,
	getTsVersionWarning: null as any,
	getVersionNumber: null as any
};

Updater.getVersionNumber = function (version: any) {
	if (!version) return 0;
	const nodes = version.split('.');
	const a = parseInt(nodes[0]);
	const b = parseInt(nodes[1]);
	const c = parseInt(nodes[2]);
	return a * 100000000 + b * 10000 + c;
};

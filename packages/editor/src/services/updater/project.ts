import { Updater } from './updater.ts';

Updater.updateProject = function (this: typeof Updater, verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const project = Updater.hooks.getProject()!;
		if (!project.openEvents) {
			project.openEvents = [];
		}
		if (!project.uiPrefabs) {
			project.uiPrefabs = [];
		}
	}
};

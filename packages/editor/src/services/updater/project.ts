import { Updater } from './updater.ts';

function updateProject(this: typeof Updater, verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const project = Updater.hooks.getProject()!;
		if (!project.openEvents) {
			project.openEvents = [];
		}
		if (!project.uiPrefabs) {
			project.uiPrefabs = [];
		}
	}
}

export function initUpdaterProject(): void {
	Updater.updateProject = updateProject;
}

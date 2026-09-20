import { useProjectSettingsWindow } from '@app/composables/useProjectSettingsWindow';
import { getProjectStore } from '@app/stores/project';

export const Project = {
	get changed() {
		return useProjectSettingsWindow().changed;
	},
	set changed(value: boolean) {
		useProjectSettingsWindow().setChanged(value);
	},
	get importedFonts() {
		return useProjectSettingsWindow().importedFonts;
	},
	get languages() {
		return useProjectSettingsWindow().languages;
	},
	get tscStarted() {
		return useProjectSettingsWindow().tscStarted;
	},
	get initialize() {
		return useProjectSettingsWindow().initialize;
	},
	get open() {
		return useProjectSettingsWindow().open;
	},
	get startTSC() {
		return useProjectSettingsWindow().startTSC;
	},
	get stopTSC() {
		return useProjectSettingsWindow().stopTSC;
	},
	get windowClose() {
		return useProjectSettingsWindow().windowClose;
	},
	get windowClosed() {
		return useProjectSettingsWindow().windowClosed;
	},
	get projectChange() {
		return useProjectSettingsWindow().projectChange;
	},
	get dataChange() {
		return useProjectSettingsWindow().dataChange;
	},
	get paramInput() {
		return useProjectSettingsWindow().paramInput;
	},
	get confirm() {
		return useProjectSettingsWindow().confirm;
	},
	close: null as (() => void) | null
};

const projectStateKeys = ['state', 'target', 'data'] as const;

for (const key of projectStateKeys) {
	Object.defineProperty(Project, key, {
		get: () => getProjectStore()[key],
		set: (value: unknown) => {
			(getProjectStore() as Record<(typeof projectStateKeys)[number], unknown>)[key] = value;
		},
		configurable: true
	});
}

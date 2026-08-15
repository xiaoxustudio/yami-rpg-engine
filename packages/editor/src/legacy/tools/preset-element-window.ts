import {
	usePresetElementWindow,
	type PresetElementNode
} from '@app/composables/usePresetElementWindow';

export type { PresetElementNode };

export const PresetElement = {
	get ui() {
		return usePresetElementWindow().ui;
	},
	get list() {
		return usePresetElementWindow().list;
	},
	get searcher() {
		return usePresetElementWindow().searcher;
	},
	get target() {
		return usePresetElementWindow().target;
	},
	get nodes() {
		return usePresetElementWindow().nodes;
	},
	get initialize() {
		return usePresetElementWindow().initialize;
	},
	get open() {
		return usePresetElementWindow().open;
	},
	get buildNodes() {
		return usePresetElementWindow().buildNodes;
	},
	get getDefaultPresetId() {
		return usePresetElementWindow().getDefaultPresetId;
	},
	get windowClosed() {
		return usePresetElementWindow().windowClosed;
	},
	get uiIdWrite() {
		return usePresetElementWindow().uiIdWrite;
	},
	get listOpen() {
		return usePresetElementWindow().listOpen;
	},
	get searcherKeydown() {
		return usePresetElementWindow().searcherKeydown;
	},
	get searcherInput() {
		return usePresetElementWindow().searcherInput;
	},
	get confirm() {
		return usePresetElementWindow().confirm;
	}
};

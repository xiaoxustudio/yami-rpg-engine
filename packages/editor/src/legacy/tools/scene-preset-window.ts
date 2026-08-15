import {
	usePresetObjectWindow,
	type PresetObjectNode
} from '@app/composables/usePresetObjectWindow';

export type { PresetObjectNode };

export const PresetObject = {
	get scene() {
		return usePresetObjectWindow().scene;
	},
	get list() {
		return usePresetObjectWindow().list;
	},
	get searcher() {
		return usePresetObjectWindow().searcher;
	},
	get target() {
		return usePresetObjectWindow().target;
	},
	get nodes() {
		return usePresetObjectWindow().nodes;
	},
	get initialize() {
		return usePresetObjectWindow().initialize;
	},
	get open() {
		return usePresetObjectWindow().open;
	},
	get buildNodes() {
		return usePresetObjectWindow().buildNodes;
	},
	get getDefaultPresetId() {
		return usePresetObjectWindow().getDefaultPresetId;
	},
	get windowClosed() {
		return usePresetObjectWindow().windowClosed;
	},
	get sceneIdWrite() {
		return usePresetObjectWindow().sceneIdWrite;
	},
	get listOpen() {
		return usePresetObjectWindow().listOpen;
	},
	get searcherKeydown() {
		return usePresetObjectWindow().searcherKeydown;
	},
	get searcherInput() {
		return usePresetObjectWindow().searcherInput;
	},
	get confirm() {
		return usePresetObjectWindow().confirm;
	}
};

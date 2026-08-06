import { Updater } from './updater.ts';
import { Editor } from '@/main/editor.ts';

Updater.updateProject = function (this: any, verNum: any) {
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		if (!(Editor.project as any).openEvents) {
			(Editor.project as any).openEvents = [] as any[];
		}
		if (!(Editor.project as any).uiPrefabs) {
			(Editor.project as any).uiPrefabs = [] as any[];
		}
	}
};

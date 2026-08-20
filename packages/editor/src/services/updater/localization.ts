import { Path } from '@app/utils/config';
import { FSP } from '@app/services/file-system/fs-bridge.ts';
import { Editor } from '@app/services/project/editor.ts';
import { Updater } from './updater.ts';

async function createLocalization(verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.54')) {
		const path = Path.resolve!(
			Path.dirname!(Editor.config!.project!),
			'Data/localization.json'
		);
		const json = JSON.stringify({ list: [] }, null, 2);
		await FSP.writeFile(path, json);
	}
}

export function initUpdaterLocalization(): void {
	Updater.createLocalization = createLocalization;
}

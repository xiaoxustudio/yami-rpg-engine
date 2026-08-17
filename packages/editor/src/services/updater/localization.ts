import { File } from '@app/legacy/file/file-system-core.ts';
import { FSP } from '@app/services/file-system/fs-bridge.ts';
import { Updater } from './updater.ts';

Updater.createLocalization = async function (verNum: number) {
	if (verNum < Updater.getVersionNumber!('1.0.54')) {
		const path = File.path!('Data/localization.json');
		const json = JSON.stringify({ list: [] }, null, 2);
		await FSP.writeFile(path, json);
	}
};

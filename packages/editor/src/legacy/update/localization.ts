import { File } from '@/file/file-system-core.ts';
import { FSP } from '@/file/file-system.ts';
import { Updater } from './updater.ts';

Updater.createLocalization = async function (verNum: any) {
	if (verNum < Updater.getVersionNumber('1.0.54')) {
		const path = (File.path as any)('Data/localization.json');
		const json = JSON.stringify({ list: [] }, null, 2);
		await FSP.writeFile(path, json);
	}
};

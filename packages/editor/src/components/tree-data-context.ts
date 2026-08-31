import { TreeDataContext as YMTreeDataContext } from '@ui-kit';
import { getYamiI18n } from '@app/i18n';
import { getLocalStore } from '@app/stores/local';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

export class TreeDataContext extends YMTreeDataContext {
	constructor(data: Record<string, unknown>, keysField: string) {
		super(data as Record<string, unknown> & { settings: Record<string, string> }, keysField, {
			language: getLocalStore().language,
			get: (key: string) => t(key),
			createGetter: (key: string) => (sub: string) => t(key + '.' + sub)
		});
	}
}

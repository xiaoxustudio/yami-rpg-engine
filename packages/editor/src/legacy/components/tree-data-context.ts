import { TreeDataContext as YMTreeDataContext } from '@ui-kit';
import { createGetter, t } from '@app/i18n';
import { getLocalStore } from '@app/stores/local';

export class TreeDataContext extends YMTreeDataContext {
	constructor(data: Record<string, unknown>, keysField: string) {
		super(data as Record<string, unknown> & { settings: Record<string, string> }, keysField, {
			language: getLocalStore().language,
			get: (key: string) => t(key),
			createGetter: (key: string) => createGetter(key)
		});
	}
}

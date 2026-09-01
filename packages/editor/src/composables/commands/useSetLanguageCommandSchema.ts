/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getLoadedLocaleData, getYamiI18n } from '@app/i18n';
import { getFocus, write } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.setLanguage = new CommandSchema({
	name: 'setLanguage',
	fields: [{ key: 'language', default: 'auto' }],
	customParse({ language }: { language: string }) {
		return [
			{ color: 'system' },
			{ text: t('command.setLanguage') + Token(': ') },
			{ text: t('languages.' + language) }
		];
	},
	createLanguageItems() {
		const items = [];
		const properties = getLoadedLocaleData(getYamiI18n().global.locale.value)?.properties as
			| Record<string, unknown>
			| undefined;
		const languages = (properties?.languages ?? {}) as Record<string, string>;
		if (Object.keys(languages).length > 0) {
			const langList = new Set(
				Data.config.localization.languages.map((lang: { name: string }) => lang.name)
			);
			for (const [value, name] of Object.entries(languages)) {
				if (value === 'auto' || langList.has(value)) {
					items.push({ name, value });
				}
			}
		}
		return items;
	}
});

export function useSetLanguageCommandSchema() {
	return useCommandSchema('setLanguage', {
		skipWrite: true,
		onLoad(params) {
			const el = document.getElementById('setLanguage-language')!;
			el.loadItems(Command.cases.setLanguage.createLanguageItems!());
			write(el, params.language ?? 'auto');
			getFocus(el);
		}
	});
}

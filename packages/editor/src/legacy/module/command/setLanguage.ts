import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { t, tObject } from '@app/i18n';

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
		const languages = tObject<Record<string, string>>('languages');
		if (languages) {
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

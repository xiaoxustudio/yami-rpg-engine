import { $, getElementReader } from '@/util/dom.ts';
import { getFocus, write } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setLanguage = new CommandSchema({
	name: 'setLanguage',
	fields: [{ key: 'language', default: 'auto' }],
	customParse({ language }: { language: string }) {
		return [
			{ color: 'system' },
			{ text: Local.get!('command.setLanguage') + Token(': ') },
			{ text: Local.get!('languages.' + language) }
		];
	},
	onLoad(data: Record<string, unknown>) {
		const el = $('#setLanguage-language');
		el.loadItems(this.createLanguageItems!());
		write(el, data.language ?? 'auto');
		getFocus(el);
	},
	customSave() {
		Command.save({ language: getElementReader('setLanguage')('language') });
	},
	createLanguageItems() {
		const items = [];
		const languages = Local.get!('languages');
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

import * as Path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FS, FSP } from '@app/services/file-system/fs-bridge.ts';
import type { LocaleData } from './convert';

export type LanguageEntry = { key: string; alias: string; filename: string };

export function resolveLocalesDir(): string {
	const moduleURL = new URL(import.meta.url);
	const modulePath =
		typeof fileURLToPath === 'function' && moduleURL.protocol === 'file:'
			? fileURLToPath(moduleURL)
			: '';
	const moduleDir = modulePath
		? Path.dirname(Path.dirname(modulePath))
		: typeof process !== 'undefined' &&
			  typeof process.cwd === 'function' &&
			  typeof Path.resolve === 'function'
			? Path.resolve(process.cwd(), 'Project')
			: '';
	return moduleDir ? Path.resolve(moduleDir, 'Locales') : '';
}

export async function loadLanguageList(): Promise<LanguageEntry[]> {
	const dirname = resolveLocalesDir();
	const languages: LanguageEntry[] = [];
	try {
		const files = (await FSP.readdir(dirname, { withFileTypes: true })) as Array<{
			name: string;
			isDirectory(): boolean;
			isFile(): boolean;
		}>;
		for (const file of files) {
			if (file.isDirectory()) continue;
			const name = file.name;
			const extname = Path.extname(name);
			if (extname.toLowerCase() !== '.json') continue;
			const basename = Path.basename(name, extname);
			const match = basename.match(/\.(.+)$/);
			if (match) {
				languages.push({
					key: basename.slice(0, match.index),
					alias: match[1],
					filename: name
				});
			} else {
				languages.push({ key: basename, alias: basename, filename: name });
			}
		}
	} catch {
		return [];
	}
	return languages;
}

export async function loadLanguage(filename: string): Promise<LocaleData> {
	const dirname = resolveLocalesDir();
	const absPath = Path.resolve(dirname, filename);
	const content = FS.readFileSync(absPath, 'utf-8');
	return JSON.parse(content) as LocaleData;
}

export function resolveLanguage(languages: LanguageEntry[], requested?: string): string {
	if (requested && languages.some((l) => l.key === requested)) return requested;
	let language = 'en-US';
	let matchedWeight = 0;
	const sKeys =
		typeof navigator !== 'undefined' && typeof navigator.language === 'string'
			? navigator.language.split('-')
			: ['en', 'US'];
	for (const { key } of languages) {
		const dKeys = key.split('-');
		if (sKeys[0] === dKeys[0]) {
			let weight = 0;
			for (const sKey of sKeys) {
				if (dKeys.includes(sKey)) weight++;
			}
			if (matchedWeight < weight) {
				matchedWeight = weight;
				language = key;
			}
		}
	}
	return language;
}

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { LocaleData } from '@app/i18n/convert';

/**
 * 测试侧的语言包读取：入口 + 命名空间分片聚合。
 *
 * 语言包按 `Locales/<lang>/components.<ns>.json` 拆分，运行时由 i18n 懒加载；
 * 测试要校验**完整**文案集合，所以这里一次性聚合（布局与门禁见 `scripts/i18n-key-guard.mjs`）。
 */
export const LOCALES_DIR = join(process.cwd(), 'Project/Locales');

export function listLocaleEntryFiles(): string[] {
	return readdirSync(LOCALES_DIR)
		.filter((name) => name.toLowerCase().endsWith('.json'))
		.sort();
}

export function loadLocaleBundle(entryFile: string): LocaleData {
	const entry = JSON.parse(readFileSync(join(LOCALES_DIR, entryFile), 'utf8')) as LocaleData;
	const components = { ...entry.components };
	const chunkDir = join(LOCALES_DIR, entryFile.split('.')[0]);
	if (existsSync(chunkDir)) {
		for (const name of readdirSync(chunkDir).filter((item) => item.endsWith('.json'))) {
			const chunk = JSON.parse(readFileSync(join(chunkDir, name), 'utf8')) as {
				components?: Record<string, Record<string, unknown>>;
			};
			Object.assign(components, chunk.components ?? {});
		}
	}
	return { properties: entry.properties ?? {}, components };
}

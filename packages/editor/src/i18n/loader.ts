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

/**
 * 组件 id → 懒加载分片命名空间。
 *
 * 与 `scripts/oneoff/i18n-split-locales.mjs` 的 `namespaceOf` 必须一致：分片文件名就是
 * `components.<namespace>.json`，运行时按同一规则拼路径，因此不需要 id → 文件索引。
 */
export function componentNamespaceOf(id: string): string {
	return id.split('-')[0];
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

/**
 * 读语言入口文件：`properties` + 无法懒加载的组件键（`[confirm]` 这类静态本地化键）。
 *
 * 其余组件键在同名子目录的分片里，由 {@link loadComponentNamespace} 按命名空间懒加载。
 */
export async function loadLanguage(filename: string): Promise<LocaleData> {
	const dirname = resolveLocalesDir();
	const absPath = Path.resolve(dirname, filename);
	const content = FS.readFileSync(absPath, 'utf-8');
	return JSON.parse(content) as LocaleData;
}

/** 该语言目录下所有组件命名空间分片名（`components.<ns>.json` → ns）。 */
export async function listComponentNamespaces(langKey: string): Promise<string[]> {
	const dirname = resolveLocalesDir();
	if (!dirname) return [];
	try {
		const files = await FSP.readdir(Path.resolve(dirname, langKey));
		return files
			.map((name) => /^components\.([A-Za-z0-9_]+)\.json$/.exec(name)?.[1])
			.filter((name): name is string => Boolean(name))
			.sort();
	} catch {
		return [];
	}
}

/** 读一个组件命名空间分片；分片不存在（或语言目录尚未拆分）时返回 null。 */
export async function loadComponentNamespace(
	langKey: string,
	namespace: string
): Promise<Record<string, Record<string, unknown>> | null> {
	if (!/^[A-Za-z0-9_]+$/.test(namespace)) return null;
	const dirname = resolveLocalesDir();
	const absPath = Path.resolve(dirname, langKey, `components.${namespace}.json`);
	try {
		const content = await FSP.readFile(absPath, 'utf-8');
		const parsed = JSON.parse(content) as {
			components?: Record<string, Record<string, unknown>>;
		};
		return parsed.components ?? null;
	} catch {
		return null;
	}
}

/**
 * 入口 + 全部分片一次读完并合并成完整的 {@link LocaleData}。
 *
 * 分片的收益在**文件布局**（按组件命名空间收敛、diff 小），运行期必须与单文件语言包等价：
 * 逐片 `mergeLocaleMessage` 会让所有 `t()` 消费者重渲染，项目打开后挂着 250+ 窗口时会把
 * 渲染进程跑死（实测）。所以这里并行读盘、在内存里合并一次，调用方只 `setLocaleMessage` 一次。
 */
export async function loadLanguageBundle(filename: string, langKey: string): Promise<LocaleData> {
	const data = await loadLanguage(filename);
	const namespaces = await listComponentNamespaces(langKey);
	if (namespaces.length === 0) return data;
	const chunks = await Promise.all(
		namespaces.map((namespace) => loadComponentNamespace(langKey, namespace))
	);
	const components = { ...data.components };
	for (const chunk of chunks) {
		if (chunk) Object.assign(components, chunk);
	}
	return { ...data, components };
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

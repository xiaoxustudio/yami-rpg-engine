import Path from 'node:path';
import { fs } from './constants.ts';
import type { MonacoApi } from '@app/utils/monaco';

export function loadDtsFolder(folderPath: string, monaco: MonacoApi, recursive = true) {
	const disposables: unknown[] = [];
	// 直接取 `languages.typescript`：`MonacoApi` 就是「`editor.api` + 本仓注册过的两个语言贡献」的
	// 实情形状（见 `utils/monaco.ts`），`javascriptDefaults` / `typescriptDefaults` 有 monaco 自带的
	// `LanguageServiceDefaults` 类型 ⇒ 原先那处 `as unknown as { … }` 已不需要。
	const tsLang = monaco.languages.typescript;

	function walkDirectory(currentPath: string) {
		try {
			const files = fs.readdirSync(currentPath);

			files.forEach((file: string) => {
				const fullPath = Path.join(currentPath, file);

				const stat = fs.statSync(fullPath);

				if (stat.isDirectory()) {
					if (recursive) {
						walkDirectory(fullPath);
					}
				} else if (file.endsWith('.ts')) {
					try {
						const content = fs.readFileSync(fullPath, 'utf-8');

						const normalizedPath = fullPath.replace(/\\/g, '/');
						const fileUri = 'file://' + normalizedPath;

						disposables.push(tsLang.javascriptDefaults.addExtraLib(content, fileUri));
						disposables.push(tsLang.typescriptDefaults.addExtraLib(content, fileUri));
					} catch (readErr) {
						console.error(`Failed to read file: ${fullPath}`, readErr);
					}
				}
			});
		} catch (err) {
			console.error(`Failed to read directory: ${currentPath}`, err);
		}
	}

	walkDirectory(folderPath);

	return disposables;
}

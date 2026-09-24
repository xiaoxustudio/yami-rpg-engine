import Path from 'node:path';
import { fs } from './constants.ts';

export function loadDtsFolder(
	folderPath: string,
	monaco: typeof import('monaco-editor'),
	recursive = true
) {
	const disposables: unknown[] = [];
	// ⚠️ 保留 `unknown` 跳板（第 150 轮实测）：monaco 0.55 的类型里 `languages.typescript` 只是
	// 一个占位（tsc 原话：`Property 'javascriptDefaults' does not exist on type '{ deprecated: true; }'`），
	// 而语言服务的类型**没地方 import** —— 贡献模块 `esm/vs/language/typescript/monaco.contribution.d.ts`
	// 的内容就是一行 `export {}`（本轮实际打开确认过）。运行期那个对象是真的
	// `LanguageServiceDefaults`（本仓 `utils/monaco.ts` 里 import 了贡献模块并挂上），
	// 所以这里只能把形状写出来再断言。
	const tsLang = monaco.languages.typescript as unknown as {
		javascriptDefaults: { addExtraLib: (content: string, filePath?: string) => unknown };
		typescriptDefaults: { addExtraLib: (content: string, filePath?: string) => unknown };
	};

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

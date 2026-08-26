import Path from 'node:path';
import { fs } from './constants.ts';

export function loadDtsFolder(
	folderPath: string,
	monaco: typeof import('monaco-editor'),
	recursive = true
) {
	const disposables: unknown[] = [];
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

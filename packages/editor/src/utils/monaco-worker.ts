// oxlint-disable-next-line import/default
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// oxlint-disable-next-line import/default
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
// oxlint-disable-next-line import/default
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

let installed = false;

export function setupMonacoWorker(): void {
	if (installed) return;
	installed = true;
	(self as { MonacoEnvironment?: { getWorker(...args: unknown[]): Worker } }).MonacoEnvironment =
		{
			getWorker(_workerId: string, label: string) {
				switch (label) {
					case 'typescript':
					case 'javascript':
						return new TsWorker();
					case 'json':
						return new JsonWorker();
					default:
						return new EditorWorker();
				}
			}
		};
}

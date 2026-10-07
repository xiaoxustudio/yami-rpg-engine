import { setupMonacoWorker } from './monaco-worker';
import type * as editorApiNs from 'monaco-editor/esm/vs/editor/editor.api';

type EditorApi = typeof editorApiNs;

type TypescriptContribution =
	typeof import('monaco-editor/esm/vs/language/typescript/monaco.contribution');
type JsonContribution = typeof import('monaco-editor/esm/vs/language/json/monaco.contribution');

export type MonacoApi = Omit<EditorApi, 'languages'> & {
	languages: Omit<EditorApi['languages'], 'typescript' | 'json'> & {
		typescript: TypescriptContribution;
		json: JsonContribution;
	};
};

let monacoPromise: Promise<MonacoApi> | undefined;

export function getMonaco(): Promise<MonacoApi> {
	return (monacoPromise ??= (async () => {
		setupMonacoWorker();
		const monaco = await import('monaco-editor/esm/vs/editor/editor.api');
		await import('monaco-editor/esm/vs/editor/editor.all');
		const tsContribution = await Promise.all([
			import('monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'),
			import('monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution'),
			import('monaco-editor/esm/vs/language/typescript/monaco.contribution')
		]);
		const jsonContribution =
			await import('monaco-editor/esm/vs/language/json/monaco.contribution');
		const languages = Object.assign(
			monaco.languages as Omit<EditorApi['languages'], 'typescript' | 'json'>,
			{
				typescript: tsContribution[2],
				json: jsonContribution
			}
		);
		return { ...monaco, languages };
	})());
}

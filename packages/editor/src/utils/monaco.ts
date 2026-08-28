import { setupMonacoWorker } from './monaco-worker';

type MonacoApi = typeof import('monaco-editor');

let monacoPromise: Promise<MonacoApi> | undefined;

export function getMonaco(): Promise<MonacoApi> {
	return (monacoPromise ??= (async () => {
		setupMonacoWorker();
		const monaco =
			(await import('monaco-editor/esm/vs/editor/editor.api')) as unknown as MonacoApi;
		await import('monaco-editor/esm/vs/editor/editor.all');
		// 语言 id + tokenizer（语法高亮）来自 basic-languages；语言服务（hover/补全）来自 language contribution
		const tsContribution = await Promise.all([
			import('monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'),
			import('monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution'),
			import('monaco-editor/esm/vs/language/typescript/monaco.contribution')
		]);
		const jsonContribution =
			await import('monaco-editor/esm/vs/language/json/monaco.contribution');
		// editor.main 通过显式赋值注册语言贡献，按需导入需自行注册
		(monaco.languages as Record<string, unknown>).typescript = tsContribution[2];
		(monaco.languages as Record<string, unknown>).json = jsonContribution;
		return monaco;
	})());
}

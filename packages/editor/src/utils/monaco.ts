import { setupMonacoWorker } from './monaco-worker';

type MonacoApi = typeof import('monaco-editor');

let monacoPromise: Promise<MonacoApi> | undefined;

export function getMonaco(): Promise<MonacoApi> {
	return (monacoPromise ??= (async () => {
		setupMonacoWorker();
		// ⚠️ 保留 `unknown` 跳板（第 150 轮实测，本轮复核过）：`MonacoApi`（= `typeof import('monaco-editor')`
		// = `editor.main`）比本模块的运行时对象**多出 6 个成员** —— tsc 原话：
		//   「missing the following properties from type … : createWebWorker, css, html, json, and 2 more」
		// 我们只注册了 typescript / json 两个语言贡献（下面几行），css / html / createWebWorker 等
		// 从未注册 ⇒ 单次 `as MonacoApi` 报 TS2352（«neither type sufficiently overlaps»）。
		// 跳板主张的是「按需注册过的这部分当作全量 API 用」；要拆得让消费方只依赖已注册的那几个面
		// （那是跨多文件的类型收窄，不是一处能改完的）。
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

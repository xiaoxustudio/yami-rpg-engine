import { setupMonacoWorker } from './monaco-worker';
import type * as editorApiNs from 'monaco-editor/esm/vs/editor/editor.api';

/** 本模块运行时真正 import 的入口 —— `editor.api`（按需入口，不含 css / html / lsp / createWebWorker） */
type EditorApi = typeof editorApiNs;

/** 按需注册的语言贡献。它们的 `.d.ts` 在包里是 `export {}`，真实导出面见
 * `@app/types/monaco-contributions.d.ts`（那里用的是 monaco 自带的类型，不另造形状）。 */
type TypescriptContribution =
	typeof import('monaco-editor/esm/vs/language/typescript/monaco.contribution');
type JsonContribution = typeof import('monaco-editor/esm/vs/language/json/monaco.contribution');

/**
 * `getMonaco()` 的产物 = `editor.api` + 本模块挂上的 typescript / json 两个语言贡献。
 *
 * 它**不是** `typeof import('monaco-editor')`（= `editor.main`，比 `editor.api` 多出
 * `createWebWorker` / `css` / `html` / `lsp` 等本模块**从未注册**的成员）—— 返回类型原先照抄全量入口，
 * 于是只能靠 `as unknown as` 把「按需注册过的这一部分」硬说成全量 API。改成按运行期实情声明后，
 * 断言整段消失，`module/monaco-dts.ts` 也能直接拿到有类型的 `languages.typescript`。
 */
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
		// 语言 id + tokenizer（语法高亮）来自 basic-languages；语言服务（hover/补全）来自 language contribution
		const tsContribution = await Promise.all([
			import('monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'),
			import('monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution'),
			import('monaco-editor/esm/vs/language/typescript/monaco.contribution')
		]);
		const jsonContribution =
			await import('monaco-editor/esm/vs/language/json/monaco.contribution');
		// editor.main 通过显式赋值注册语言贡献，按需导入需自行注册。
		// （`monaco.languages` 的两个占位成员收窄掉再赋值：运行期仍是**同一个对象**、原地挂两个贡献，
		//  只是让类型与 `MonacoApi['languages']` 对上 —— 原先这里靠 `as unknown as` 蒙过去。）
		const languages = Object.assign(
			monaco.languages as Omit<EditorApi['languages'], 'typescript' | 'json'>,
			{
				typescript: tsContribution[2],
				json: jsonContribution
			}
		);
		// 返回的是**模块命名空间的一层浅拷贝**，`languages` 换成挂过贡献的那个（同一个对象）。
		// 消费方一律按属性取用（`monaco.editor` / `monaco.Position` / `monaco.languages`），
		// 属性值与函数引用逐字相同 ⇒ 运行期等价；这一层拷贝只是让返回类型能与
		// `MonacoApi`（= `editor.api` + 已注册贡献）对上，避免再写一次 `as unknown as`。
		return { ...monaco, languages };
	})());
}

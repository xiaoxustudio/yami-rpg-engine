/**
 * monaco 0.55 的**按需语言贡献**子模块在包里没有可用的类型：
 * `esm/vs/language/typescript/monaco.contribution.d.ts` 的内容只是一行 `export {}`
 * （`json` 那个同理，但本仓只用它当 `languages.json` 的占位值，不需要成员）。
 *
 * 于是「从贡献模块取语言服务默认值」在类型上取不到任何东西 —— `utils/monaco.ts` 先前只能靠
 * `as unknown as` 把动态 import 的结果硬说成想要的形状，`module/monaco-dts.ts` 又跟着断言一次。
 * 这里按**运行期实情**把该子模块的导出面声明下来（类型取自 monaco 自己的
 * `typescript.LanguageServiceDefaults`，不另造形状），两处断言随之全部消失。
 *
 * 本文件是**全局脚本**（没有任何顶层 import/export），因此 `declare module` 是环境模块声明；
 * 运行期零影响 —— 类型只描述既有的 `import(...)`，加载方式仍是按需动态 import。
 */
declare module 'monaco-editor/esm/vs/language/typescript/monaco.contribution' {
	export const javascriptDefaults: import('monaco-editor').typescript.LanguageServiceDefaults;
	export const typescriptDefaults: import('monaco-editor').typescript.LanguageServiceDefaults;
	export const typescriptVersion: string;
}

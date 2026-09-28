export type SettingType = 'text' | 'number' | 'checkbox' | 'select';

export interface OptionContext {
	get: (key: string) => string;
	config: Record<string, unknown>;
}

export interface SelectItem {
	name: string;
	value: string | number;
}

export interface SettingOption {
	key: string;
	type: SettingType;
	default: string | number | boolean;
	id?: string;
	hidden?: boolean;
	min?: number;
	max?: number;
	step?: number;
	optionsFn?: (ctx: OptionContext) => SelectItem[] | Promise<SelectItem[]>;
	validate?: (value: string | number | boolean, config: Record<string, unknown>) => string | null;
	onChange?: (value: string | number | boolean, config: Record<string, unknown>) => void;
	tooltipPath?: boolean;
	labelKey?: string;
	labelId?: string;
	labelFallback?: string;
}

export interface SettingSection {
	id: string;
	titleKey?: string;
	titleFallback?: string;
	options: SettingOption[];
	subgroups?: SettingSection[];
}

/**
 * **不是**按 `settingSchema` 推：schema 是运行期数据（`SettingSection[]`，`id: string`），
 * `buildDefaultConfig()` 只返回 `Record<string, unknown>` ⇒ 类型层没有真源，只能手写。
 *
 * 三条约定（都实测过，别随手改）：
 *  1. **顶层必须留索引签名，且值类型要可再索引**：`index.ts` 的 `load()` 按
 *     `Object.keys(defaultConfig)` 动态补默认值，会写 `config[key][sub]` 与 `config[key] ??= {}`
 *     ⇒ 值类型得是 `Record<string, unknown>`，不能是 `unknown`。
 *  2. **已知分区不标 `?`**：`apply()` 里裸取 `config.server.port`（不带 `?.`）。标成可选就逼着改那行，
 *     而改成 `?.` 会把「config 还没加载」这条路径从**抛错**变成**静默写入 `undefined`** —— 行为变化。
 *     类型在这里表达的是**调用前提**：`apply()` 只从 `save()` 进入，而 `save()` 之前必先 `load()`。
 *  3. **用 `type` 而不是 `interface`**：`renderer.ts` 的 `SettingHost.config` 是
 *     `Record<string, unknown>`，而 TS 只对**对象类型别名**推断隐式索引签名（`interface` 不推断）。
 *
 * 下面 7 个分区与 `settingSchema` 的顶层 `id` **逐个对齐**（server / apkbuild / signed / other /
 * recent / github / update），而 `buildDefaultConfig()` 保证每个分区都存在 ⇒ `index.ts` 里
 * `patch()` 那次断言是与前提一致的（不是「断言可能说谎」）。
 */
export type SettingConfigShape = {
	server: { port: number; auto?: boolean; [key: string]: unknown };
	apkbuild: Record<string, unknown>;
	signed: Record<string, unknown>;
	other: {
		browserSearchHistoryLimit: number | string;
		// 由 `YMCommandList` 读：`ui-kit` 的 `command-api.ts:231` 把 `settingConfig` 的契约写成
		// `{ config: { other: { copyAsTextKeepEmptyLine: boolean } } }`（**非可选**）。
		// 它确实是 schema 里的字段（`schema.ts` 的 `other` 分区，checkbox，默认 `true`），
		// 而 `load()` 会按 schema 补默认值 ⇒ 加载后必然存在（与 `server.port` 同一前提）。
		copyAsTextKeepEmptyLine: boolean;
		[key: string]: unknown;
	};
	recent: { statsMode?: string; [key: string]: unknown };
	github: { accelerationNode?: string; [key: string]: unknown };
	update: { checkOnStart?: boolean; [key: string]: unknown };
	[key: string]: Record<string, unknown>;
};

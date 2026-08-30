// 语言 JSON → vue-i18n messages 转换（扁平表）。
// JSON 采用 vue-i18n 推荐的嵌套树写法：properties/components 两段均为嵌套对象。
// properties 展平为点路径键；"值 vs 前缀"冲突键（既含字符串值又含子项）以 `name`
// 子键存储字符串值，展平时提升为父级完整键（如 command.setVideo.name → command.setVideo）。
// components 段 label/tip/content/options。
// vue-i18n 经自定义 messageResolver 按完整键精确查询（+ legacy common fallback）。

export type LocaleData = {
	properties: Record<string, unknown>;
	components: Record<string, Record<string, unknown>>;
};

export type FlatMessages = Record<string, string>;

// 递归展开嵌套对象为点路径键；叶子 `name` 提升为父级完整键（值限定为字符串/数字/布尔）
function flatten(obj: unknown, prefix: string, out: Record<string, string>): void {
	if (obj === null || typeof obj !== 'object') return;
	for (const key of Object.keys(obj as Record<string, unknown>)) {
		const path = prefix ? `${prefix}.${key}` : key;
		const value = (obj as Record<string, unknown>)[key];
		if (value !== null && typeof value === 'object') {
			flatten(value, path, out);
		} else if (
			typeof value === 'string' ||
			typeof value === 'number' ||
			typeof value === 'boolean'
		) {
			const flatKey = key === 'name' && prefix ? prefix : path;
			out[flatKey] = String(value);
		}
	}
}

// components 段转换：label/tip/content + options（字符串直值/对象统一 name+label）
function flattenComponents(
	components: Record<string, Record<string, unknown>>,
	out: Record<string, string>
): void {
	for (const id of Object.keys(components)) {
		const comp = components[id] ?? {};
		const put = (suffix: string, value: unknown): void => {
			if (typeof value === 'string') out[`components.${id}.${suffix}`] = value;
		};
		put('title', comp.title);
		put('label', comp.label);
		put('tip', comp.tip);
		put('content', comp.content);
		const options = comp.options;
		if (options !== undefined && typeof options === 'object') {
			for (const optKey of Object.keys(options as Record<string, unknown>)) {
				const opt = (options as Record<string, unknown>)[optKey];
				if (typeof opt === 'string') {
					// 字符串直值：同作 name 与 label（兼容旧 getLabel / 新 t 双习惯）
					out[`components.${id}.options.${optKey}.name`] = opt;
					out[`components.${id}.options.${optKey}.label`] = opt;
				} else if (opt !== null && typeof opt === 'object') {
					const o = opt as { name?: string; tip?: string };
					if (typeof o.name === 'string') {
						out[`components.${id}.options.${optKey}.name`] = o.name;
						out[`components.${id}.options.${optKey}.label`] = o.name;
					}
					if (typeof o.tip === 'string') {
						out[`components.${id}.options.${optKey}.tip`] = o.tip;
					}
				}
			}
		}
	}
}

export function convertLocaleData(data: LocaleData): FlatMessages {
	const flat: Record<string, string> = {};
	flatten(data.properties ?? {}, '', flat);
	flattenComponents(data.components ?? {}, flat);
	return flat;
}

// 展平 properties 为点路径键（保留中间对象键，与 legacy Local.setProperties 语义一致）
export function flattenProperties(data: Record<string, unknown>): Record<string, string> {
	const map: Record<string, string> = {};
	const setProperty = (path: string, value: unknown) => {
		map[path] = value as string;
		if (value instanceof Object) {
			for (const key of Object.keys(value as Record<string, unknown>)) {
				setProperty(path + '.' + key, (value as Record<string, unknown>)[key]);
			}
		}
	};
	for (const key of Object.keys(data)) {
		setProperty(key, data[key]);
	}
	return map;
}

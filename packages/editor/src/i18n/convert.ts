export type LocaleData = {
	properties: Record<string, unknown>;
	components: Record<string, Record<string, unknown>>;
};

export type FlatMessages = Record<string, string>;

export const INTERPOLATION_NAMES: ReadonlySet<string> = new Set([
	'dirName',
	'actor',
	'team',
	'filename',
	'number',
	'size',
	'langname'
]);

const literalBraces = (inner: string): string => `{'{'}${inner}{'}'}`;

const escapeBraces = (value: string): string =>
	value.replace(/\{([^{}]*)\}|\{|\}/g, (match: string, name?: string): string => {
		if (name !== undefined && INTERPOLATION_NAMES.has(name)) return match;
		return literalBraces(match.length >= 2 ? match.slice(1, -1) : '');
	});

const escapeMessage = (value: string): string =>
	escapeBraces(value).replace(/@/g, "{'@'}").replace(/\|/g, "{'|'}");

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
			out[flatKey] = escapeMessage(String(value));
		}
	}
}

function flattenComponents(
	components: Record<string, Record<string, unknown>>,
	out: Record<string, string>
): void {
	for (const id of Object.keys(components)) {
		const comp = components[id] ?? {};
		const put = (suffix: string, value: unknown): void => {
			if (typeof value === 'string') out[`components.${id}.${suffix}`] = escapeMessage(value);
		};
		put('title', comp.title);
		put('label', comp.label);
		put('tip', comp.tip);
		put('content', comp.content);
		// placeholder：输入类组件（Block.vue / GameData.vue / ShowText.vue…）用
		// `t('components.<id>.placeholder')` 填占位文案。漏掉这一条时 `t()` 会原样返回 key，
		// 界面上直接显示 `components.block-note.placeholder`（2026-10-30 由运行期缺失观测抓到）。
		put('placeholder', comp.placeholder);
		const options = comp.options;
		if (options !== undefined && typeof options === 'object') {
			for (const optKey of Object.keys(options as Record<string, unknown>)) {
				const opt = (options as Record<string, unknown>)[optKey];
				if (typeof opt === 'string') {
					out[`components.${id}.options.${optKey}.name`] = escapeMessage(opt);
					out[`components.${id}.options.${optKey}.label`] = escapeMessage(opt);
					// 字符串选项没有独立 tip：用同名文案兜底。否则 `t('….options.x.tip')` 会原样
					// 返回 key，tooltip 上直接显示 `components.loop-mode.options.all.tip`。
					out[`components.${id}.options.${optKey}.tip`] = escapeMessage(opt);
				} else if (opt !== null && typeof opt === 'object') {
					const o = opt as { name?: string; tip?: string };
					if (typeof o.name === 'string') {
						out[`components.${id}.options.${optKey}.name`] = escapeMessage(o.name);
						out[`components.${id}.options.${optKey}.label`] = escapeMessage(o.name);
					}
					// 对象选项缺 tip 时同样用 name 兜底（同上：宁可重复，也不要显示 key）
					const tip = typeof o.tip === 'string' ? o.tip : o.name;
					if (typeof tip === 'string') {
						out[`components.${id}.options.${optKey}.tip`] = escapeMessage(tip);
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

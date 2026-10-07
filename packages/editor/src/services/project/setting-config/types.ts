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

export type SettingConfigShape = {
	server: { port: number; auto?: boolean; [key: string]: unknown };
	apkbuild: Record<string, unknown>;
	signed: Record<string, unknown>;
	other: {
		browserSearchHistoryLimit: number | string;
		copyAsTextKeepEmptyLine: boolean;
		[key: string]: unknown;
	};
	recent: { statsMode?: string; [key: string]: unknown };
	github: { accelerationNode?: string; [key: string]: unknown };
	update: { checkOnStart?: boolean; [key: string]: unknown };
	[key: string]: Record<string, unknown>;
};

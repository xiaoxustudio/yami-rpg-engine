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

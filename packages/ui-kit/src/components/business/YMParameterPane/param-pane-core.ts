export type ParamDef = {
	type: string;
	key: string;
	alias?: string;
	desc?: string;
	prefix?: string;
	suffix?: string;
	readonly?: boolean;
	validate?:
		| boolean
		| {
				pattern: RegExp | null;
				notEmpty: boolean | null;
				minLength?: number;
				maxLength?: number;
		  };
	hidden?: boolean;
	group?: string | null;
	value?: unknown;
	repeatableGroup?: { parameters: ParamDef[] };
};

export type ParamGroupResult = {
	groupOrder: string[];
	groupMap: Map<string, ParamDef[]>;
};

export type ParamValidator = {
	checkValidate(param: ParamDef, val: unknown): boolean;
};

export interface ParamPaneCore {
	groupParameters: (paramList: ParamDef[]) => ParamGroupResult;
	deprecatedBannerText: (deprecated: unknown) => string;
	formatParamTip: (name: string, desc: string | undefined) => string;
	createRepeatableRowData: (template: ParamDef[]) => Record<string, unknown>;
	normalizeRepeatableRows: (
		value: Array<Record<string, unknown>> | null | undefined,
		template: ParamDef[]
	) => Array<Record<string, unknown>>;
	resolveSubParamValue: (item: Record<string, unknown>, subParam: ParamDef) => unknown;
	isParamValueValid: (
		param: ParamDef,
		value: unknown,
		validator: ParamValidator | null | undefined
	) => boolean;
}

export function createParamPaneCore(): ParamPaneCore {
	const groupParameters = (paramList: ParamDef[]): ParamGroupResult => {
		const groupOrder: string[] = [];
		const groupMap = new Map<string, ParamDef[]>();
		for (const parameter of paramList) {
			const g = parameter.group || '';
			if (!groupMap.has(g)) {
				groupMap.set(g, []);
				groupOrder.push(g);
			}
			groupMap.get(g)!.push(parameter);
		}
		if (!groupMap.has('')) {
			groupMap.set('', []);
			groupOrder.unshift('');
		}
		return { groupOrder, groupMap };
	};

	const deprecatedBannerText = (deprecated: unknown): string =>
		typeof deprecated === 'string' ? 'deprecated: ' + deprecated : 'deprecated';

	const formatParamTip = (name: string, desc: string | undefined): string =>
		desc ? `<b>${name}</b>\n${desc}` : '';

	const createRepeatableRowData = (template: ParamDef[]): Record<string, unknown> => {
		const row: Record<string, unknown> = {};
		for (const subParam of template) {
			row[subParam.key] = subParam.value;
		}
		return row;
	};

	const normalizeRepeatableRows = (
		value: Array<Record<string, unknown>> | null | undefined,
		template: ParamDef[]
	): Array<Record<string, unknown>> => {
		if (!value || value.length === 0) {
			return [createRepeatableRowData(template)];
		}
		return value;
	};

	const resolveSubParamValue = (item: Record<string, unknown>, subParam: ParamDef): unknown =>
		item[subParam.key] !== undefined ? item[subParam.key] : subParam.value;

	const isParamValueValid = (
		param: ParamDef,
		value: unknown,
		validator: ParamValidator | null | undefined
	): boolean => value !== undefined && !!validator?.checkValidate(param, value);

	return {
		groupParameters,
		deprecatedBannerText,
		formatParamTip,
		createRepeatableRowData,
		normalizeRepeatableRows,
		resolveSubParamValue,
		isParamValueValid
	};
}

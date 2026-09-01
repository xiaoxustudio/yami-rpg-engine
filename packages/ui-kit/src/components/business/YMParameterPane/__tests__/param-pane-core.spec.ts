import { describe, expect, it } from 'vitest';
import { createParamPaneCore, type ParamDef } from '../param-pane-core';

const core = createParamPaneCore();

describe('param-pane-core', () => {
	describe('groupParameters', () => {
		it('按 group 分组并保持首次出现顺序', () => {
			const paramList: ParamDef[] = [
				{ type: 'text-box', key: 'a', group: 'g1' },
				{ type: 'text-box', key: 'b' },
				{ type: 'text-box', key: 'c', group: 'g1' },
				{ type: 'text-box', key: 'd', group: 'g2' }
			];
			const { groupOrder, groupMap } = core.groupParameters(paramList);
			expect(groupOrder).toEqual(['g1', '', 'g2']);
			expect(groupMap.get('g1')).toEqual([paramList[0], paramList[2]]);
			expect(groupMap.get('g2')).toEqual([paramList[3]]);
			expect(groupMap.get('')).toEqual([paramList[1]]);
		});

		it('无空分组时补充空分组到首位', () => {
			const paramList: ParamDef[] = [
				{ type: 'text-box', key: 'a', group: 'g1' },
				{ type: 'text-box', key: 'b', group: 'g2' }
			];
			const { groupOrder, groupMap } = core.groupParameters(paramList);
			expect(groupOrder).toEqual(['', 'g1', 'g2']);
			expect(groupMap.get('')).toEqual([]);
		});
	});

	describe('deprecatedBannerText', () => {
		it('字符串时拼接提示文本', () => {
			expect(core.deprecatedBannerText('use X instead')).toBe('deprecated: use X instead');
		});

		it('非字符串时返回默认文本', () => {
			expect(core.deprecatedBannerText(true)).toBe('deprecated');
			expect(core.deprecatedBannerText(undefined)).toBe('deprecated');
		});
	});

	describe('formatParamTip', () => {
		it('有描述时拼接加粗名称与描述', () => {
			expect(core.formatParamTip('HP', '生命值')).toBe('<b>HP</b>\n生命值');
		});

		it('无描述时返回空字符串', () => {
			expect(core.formatParamTip('HP', undefined)).toBe('');
			expect(core.formatParamTip('HP', '')).toBe('');
		});
	});

	describe('createRepeatableRowData', () => {
		it('按模板 key 生成默认行数据', () => {
			const template: ParamDef[] = [
				{ type: 'text-box', key: 'name', value: 'x' },
				{ type: 'number-box', key: 'count', value: 1 }
			];
			expect(core.createRepeatableRowData(template)).toEqual({ name: 'x', count: 1 });
		});

		it('value 未定义时保留 undefined 字段', () => {
			const template: ParamDef[] = [{ type: 'text-box', key: 'name' }];
			const row = core.createRepeatableRowData(template);
			expect('name' in row).toBe(true);
			expect(row.name).toBeUndefined();
		});
	});

	describe('normalizeRepeatableRows', () => {
		it('空值时返回单条默认行', () => {
			const template: ParamDef[] = [{ type: 'text-box', key: 'name', value: 'x' }];
			expect(core.normalizeRepeatableRows([], template)).toEqual([{ name: 'x' }]);
			expect(core.normalizeRepeatableRows(undefined, template)).toEqual([{ name: 'x' }]);
			expect(core.normalizeRepeatableRows(null, template)).toEqual([{ name: 'x' }]);
		});

		it('非空时原样返回同一引用', () => {
			const template: ParamDef[] = [{ type: 'text-box', key: 'name', value: 'x' }];
			const rows = [{ name: 'a' }, { name: 'b' }];
			expect(core.normalizeRepeatableRows(rows, template)).toBe(rows);
		});
	});

	describe('resolveSubParamValue', () => {
		it('行数据存在时取行数据值', () => {
			const subParam: ParamDef = { type: 'text-box', key: 'name', value: 'default' };
			expect(core.resolveSubParamValue({ name: 'custom' }, subParam)).toBe('custom');
		});

		it('行数据缺失时回退模板默认值', () => {
			const subParam: ParamDef = { type: 'text-box', key: 'name', value: 'default' };
			expect(core.resolveSubParamValue({}, subParam)).toBe('default');
			expect(core.resolveSubParamValue({ name: undefined }, subParam)).toBe('default');
		});
	});

	describe('isParamValueValid', () => {
		it('值未定义时直接不通过', () => {
			const param: ParamDef = { type: 'text-box', key: 'a', validate: true };
			expect(core.isParamValueValid(param, undefined, { checkValidate: () => true })).toBe(
				false
			);
		});

		it('委托校验器并处理空校验器', () => {
			const param: ParamDef = { type: 'text-box', key: 'a', validate: true };
			expect(core.isParamValueValid(param, 'v', { checkValidate: () => true })).toBe(true);
			expect(core.isParamValueValid(param, 'v', { checkValidate: () => false })).toBe(false);
			expect(core.isParamValueValid(param, 'v', null)).toBe(false);
		});
	});
});

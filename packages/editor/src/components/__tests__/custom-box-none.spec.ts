import { describe, expect, it, vi } from 'vitest';
import { customBoxOptions } from '@app/components/custom-box-opts.ts';

vi.mock('@app/i18n', async (importOriginal) => {
	const mod = await importOriginal<typeof import('@app/i18n')>();
	return { ...mod, getYamiI18n: () => ({ global: { t: () => 'None' } }) };
});

const parse = (type: string, value: unknown): string => {
	const parser = customBoxOptions.parsers?.[type];
	if (!parser) throw new Error('no parser: ' + type);
	return parser(value).text;
};

describe('CustomBox 无数据时显示 None（本地化 common.none）', () => {
	it('parseText 系列 type 的 null/undefined → None', () => {
		for (const type of [
			'actor',
			'skill',
			'state',
			'equipment',
			'item',
			'position',
			'angle',
			'trigger',
			'light',
			'region',
			'tilemap',
			'object',
			'global-variable',
			'preset-object'
		]) {
			expect(parse(type, null)).toBe('None');
			expect(parse(type, undefined)).toBe('None');
		}
	});

	it('parseWithInvalid 系列（file/element/preset-element/attribute-group/enum-group）→ None', () => {
		for (const type of ['file', 'element', 'preset-element', 'attribute-group', 'enum-group']) {
			expect(parse(type, null)).toBe('None');
		}
	});

	it('variable/attribute/enum-string/dialog-dir/clip 的 null → None', () => {
		expect(parse('variable', null)).toBe('None');
		expect(parse('attribute', null)).toBe('None');
		expect(parse('enum-string', null)).toBe('None');
		expect(parse('dialog-dir', null)).toBe('None');
		expect(parse('clip', null)).toBe('None');
	});

	it('有值时不误伤（actor 非空返回正常解析或原始值）', () => {
		const text = parse('actor', { type: 'self' });
		expect(text).not.toBe('None');
	});
	it('空串也显示 None（file 空 guid 等）', () => {
		expect(parse('file', '')).toBe('None');
		expect(parse('actor', '')).toBe('None');
		expect(parse('dialog-dir', '')).toBe('None');
		expect(parse('attribute', '')).toBe('None');
		expect(parse('enum-string', '')).toBe('None');
	});
	it('解析结果空（无效 guid）也显示 None', () => {
		expect(parse('file', 'invalid-guid')).toBe('None');
	});
});

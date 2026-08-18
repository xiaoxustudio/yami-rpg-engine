import { describe, expect, it } from 'vitest';
import { Local } from '@app/legacy/tools/localization.ts';
import { applyLocaleData } from '@app/i18n';
import data from '../../../../Project/Locales/zh-CN.简体中文.json';

describe('localize keys', () => {
	it('resolves property keys（经 i18n 唯一真源 + Local 兼容转发）', () => {
		const locale = data as unknown as {
			properties: Record<string, unknown>;
			components: Record<string, Record<string, unknown>>;
		};
		applyLocaleData('zh-CN', locale);
		const get = (Local.createGetter as unknown as (p: string) => (k: string) => string)(
			'command.setVideo'
		);
		expect(get('loop.false')).toBe('播放一次');
		expect(get('flip.none')).toBe('无');
		expect(Local.get!('blend.normal')).toBe('正常');
		const getImg = (Local.createGetter as unknown as (p: string) => (k: string) => string)(
			'command.setImage'
		);
		expect(getImg('display.stretch')).toBe('拉伸');
	});
});

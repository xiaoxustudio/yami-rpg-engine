import { describe, expect, it } from 'vitest';
import { Local } from '@/tools/localization.ts';
import data from '../../../../Project/Locales/zh-CN.简体中文.json';

describe('localize keys', () => {
	it('resolves property keys', () => {
		(Local.setProperties as unknown as (d: unknown) => void)(
			(data as { properties: unknown }).properties
		);
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

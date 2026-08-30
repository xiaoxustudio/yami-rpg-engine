import { describe, expect, it } from 'vitest';
import { applyLocaleData, getYamiI18n } from '@app/i18n';
import data from '../../../Project/Locales/zh-CN.简体中文.json';

describe('localize keys', () => {
	it('resolves property keys（经 i18n 唯一真源）', () => {
		const locale = data as unknown as {
			properties: Record<string, unknown>;
			components: Record<string, Record<string, unknown>>;
		};
		applyLocaleData('zh-CN', locale);
		const t = (key: string) => getYamiI18n().global.t(key);
		expect(t('command.setVideo.loop.false')).toBe('播放一次');
		expect(t('command.setVideo.flip.none')).toBe('无');
		expect(t('blend.normal')).toBe('正常');
		expect(t('command.setImage.display.stretch')).toBe('拉伸');
	});
});

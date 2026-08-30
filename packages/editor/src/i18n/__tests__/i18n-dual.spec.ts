import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { applyLocaleData, initYamiI18n, getYamiI18n } from '@app/i18n';
import type { LocaleData } from '@app/i18n/convert';

function loadLocale(filename: string): LocaleData {
	const p = resolve(process.cwd(), 'Project/Locales', filename);
	return JSON.parse(readFileSync(p, 'utf8')) as LocaleData;
}

describe('i18n 唯一真源', () => {
	it('applyLocaleData 后 properties 键可用', () => {
		initYamiI18n();
		const zh = loadLocale('zh-CN.简体中文.json');
		applyLocaleData('zh-CN', zh);
		expect(getYamiI18n().global.locale.value).toBe('zh-CN');
		expect(getYamiI18n().global.t('common.create')).toBe('创建');
		expect(getYamiI18n().global.t('command.setVideo.loop.false')).toBe('播放一次');
	});

	it('components 段 label/options 可用', () => {
		initYamiI18n();
		const zh = loadLocale('zh-CN.简体中文.json');
		applyLocaleData('zh-CN', zh);
		expect(getYamiI18n().global.t('components.sceneTilemap-light.label')).toBe('光线采样');
		expect(getYamiI18n().global.t('components.sceneTilemap-light.options.raw.name')).toBe(
			'原始图像'
		);
		expect(getYamiI18n().global.t('components.sceneTilemap-light.options.raw.label')).toBe(
			'原始图像'
		);
		expect(getYamiI18n().global.t('components.sceneTilemap-light.options.global.label')).toBe(
			'全局采样'
		);
	});

	it('legacy common fallback：缺失键回退 common.<lastSegment>', () => {
		initYamiI18n();
		const zh = loadLocale('zh-CN.简体中文.json');
		applyLocaleData('zh-CN', zh);
		// 不存在 menuFile.none 时应回退 common.none
		expect(getYamiI18n().global.t('menuFile.none')).toBe(getYamiI18n().global.t('common.none'));
	});
});

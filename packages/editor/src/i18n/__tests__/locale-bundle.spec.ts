import { afterEach, describe, expect, it, vi } from 'vitest';
import { FS, FSP } from '@app/services/file-system/fs-bridge';
import { applyLocaleData, getYamiI18n, initYamiI18n } from '@app/i18n';
import { loadLanguageBundle } from '../loader';

/**
 * 分片语言包在加载期**一次**合并（入口 + `components.<ns>.json` 并行读取），
 * 运行期不再逐片 merge —— 逐片 merge 会让所有 `t()` 消费者重渲染，250+ 窗口时会卡死。
 * 这里钉住合并结果与「分片缺失退化」两条契约。
 */
afterEach(() => {
	vi.restoreAllMocks();
});

const mockLocaleFiles = (entry: unknown, chunks: Record<string, unknown>): void => {
	vi.spyOn(FS, 'readFileSync').mockReturnValue(JSON.stringify(entry));
	vi.spyOn(FSP, 'readdir').mockImplementation((() =>
		Promise.resolve([
			'components.setList.json',
			'components.probe.json',
			'README.txt'
		])) as never);
	vi.spyOn(FSP, 'readFile').mockImplementation(((path: string) =>
		Promise.resolve(
			JSON.stringify(chunks[String(path).split(/[\\/]/).pop() ?? ''] ?? {})
		)) as never);
};

describe('loadLanguageBundle：入口 + 命名空间分片一次合并', () => {
	it('并行读全部 components.<ns>.json 并合并', async () => {
		mockLocaleFiles(
			{
				format: 2,
				properties: { common: { create: '创建' } },
				components: { resource: { title: '资源' } }
			},
			{
				'components.setList.json': { components: { setList: { title: '列表' } } },
				'components.probe.json': { components: { probe: { title: '探针' } } }
			}
		);
		const data = await loadLanguageBundle('zh-CN.简体中文.json', 'zh-CN');
		expect(data.properties.common).toEqual({ create: '创建' });
		expect(Object.keys(data.components).sort()).toEqual(['probe', 'resource', 'setList']);
		expect(data.components.setList.title).toBe('列表');

		initYamiI18n();
		applyLocaleData('zh-CN', data);
		const t = getYamiI18n().global.t;
		expect(t('common.create')).toBe('创建');
		expect(t('components.setList.title')).toBe('列表');
		expect(t('components.probe.title')).toBe('探针');
	});

	it('分片目录缺失 / 分片损坏时退化为入口，不抛错', async () => {
		vi.spyOn(FS, 'readFileSync').mockReturnValue(
			JSON.stringify({ properties: { common: { none: '无' } }, components: {} })
		);
		vi.spyOn(FSP, 'readdir').mockRejectedValue(new Error('ENOENT'));
		const data = await loadLanguageBundle('zh-CN.简体中文.json', 'zh-CN');
		expect(data.properties.common).toEqual({ none: '无' });
		expect(data.components).toEqual({});
	});
});

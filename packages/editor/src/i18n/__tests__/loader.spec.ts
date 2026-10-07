import { describe, expect, it, vi, afterEach } from 'vitest';
import { resolve } from 'node:path';
import type { Dirent } from 'node:fs';
import { FS, FSP } from '@app/services/file-system/fs-bridge.ts';
import { loadLanguage, loadLanguageList, resolveLanguage, type LanguageEntry } from '../loader';

const dirent = (name: string, isFile: boolean) =>
	({
		name,
		isDirectory: () => !isFile,
		isFile: () => isFile
	}) as Dirent;

afterEach(() => {
	vi.restoreAllMocks();
});

describe('i18n loader 独立加载语言文件', () => {
	it('loadLanguageList 模拟 Locales 目录读取，解析 key/alias/filename', async () => {
		const readdir = vi
			.spyOn(FSP, 'readdir')
			.mockResolvedValue([
				dirent('en-US.English.json', true),
				dirent('zh-CN.简体中文.json', true),
				dirent('sub', false),
				dirent('README.txt', true)
			]);
		const list = await loadLanguageList();
		expect(list).toEqual([
			{ key: 'en-US', alias: 'English', filename: 'en-US.English.json' },
			{ key: 'zh-CN', alias: '简体中文', filename: 'zh-CN.简体中文.json' }
		]);
		expect(readdir).toHaveBeenCalledTimes(1);
	});

	it('loadLanguage 模拟读取单个语言 JSON → LocaleData', async () => {
		const json = JSON.stringify({
			properties: { common: { create: '创建', close: '关闭' } },
			components: { 'sceneTilemap-light': { label: '光线采样' } }
		});
		const read = vi.spyOn(FS, 'readFileSync').mockReturnValue(json);
		const data = await loadLanguage('zh-CN.简体中文.json');
		expect((data.properties as Record<string, unknown>).common).toEqual({
			create: '创建',
			close: '关闭'
		});
		expect(
			(data.components as Record<string, Record<string, unknown>>)['sceneTilemap-light'].label
		).toBe('光线采样');
		expect(read).toHaveBeenCalledTimes(1);
		const absPath = read.mock.calls[0][0] as string;
		expect(
			absPath.endsWith(resolve('Locales', 'zh-CN.简体中文.json')) ||
				absPath.endsWith('zh-CN.简体中文.json')
		).toBe(true);
	});

	it('loadLanguageList 目录读取失败返回空列表', async () => {
		vi.spyOn(FSP, 'readdir').mockRejectedValue(new Error('no such dir'));
		await expect(loadLanguageList()).resolves.toEqual([]);
	});

	it('resolveLanguage 请求语言匹配 / 自动匹配导航语言 / 回退 en-US', () => {
		const languages: LanguageEntry[] = [
			{ key: 'en-US', alias: 'English', filename: 'en-US.English.json' },
			{ key: 'zh-CN', alias: '简体中文', filename: 'zh-CN.简体中文.json' }
		];
		expect(resolveLanguage(languages, 'zh-CN')).toBe('zh-CN');
		expect(resolveLanguage(languages, 'xx-XX')).toBe('en-US');
		expect(resolveLanguage(languages)).toBe('en-US');
		expect(resolveLanguage([])).toBe('en-US');
	});
});

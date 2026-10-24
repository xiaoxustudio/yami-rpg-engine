import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import nodeFs from 'node:fs';
import nodeOs from 'node:os';
import nodePath from 'node:path';

// GlobalPath 在真实环境里是 ~/.openyami。测试把它指向临时目录，才能覆盖
// “配置目录不存在”（CI 干净 HOME）与“配置文件损坏”这两条加载分支。
const state = vi.hoisted(() => ({ configDir: '' }));

vi.mock('@app/utils/config', () => ({
	get GlobalPath() {
		return state.configDir;
	},
	GlobalPathForDir: nodeOs.tmpdir(),
	Path: nodePath
}));

type SettingConfigModule = typeof import('@app/services/project/setting-config');

const roots: string[] = [];
let mod: SettingConfigModule;

// 模块图很重（resource → webserver 等），整个文件只 import 一次：
// 首个用例走 import 期的构造 load()，其余用例显式调 load()/save()。
const makeConfigDir = (): string => {
	const root = nodeFs.mkdtempSync(nodePath.join(nodeOs.tmpdir(), 'yami-setting-config-'));
	roots.push(root);
	state.configDir = nodePath.join(root, '.openyami');
	return state.configDir;
};

const loadModule = async (): Promise<SettingConfigModule> => {
	vi.resetModules();
	return import('@app/services/project/setting-config');
};

beforeAll(async () => {
	makeConfigDir();
	mod = await loadModule();
});

afterEach(() => {
	for (const root of roots.splice(0)) {
		nodeFs.rmSync(root, { recursive: true, force: true });
	}
});

describe('SettingConfig.load', () => {
	it('配置目录不存在时不抛错，并创建目录与默认配置文件', async () => {
		const configDir = makeConfigDir();
		expect(nodeFs.existsSync(configDir)).toBe(false);

		const fresh = await loadModule();

		expect(nodeFs.existsSync(nodePath.join(configDir, 'yami-config.json'))).toBe(true);
		expect(fresh.SettingConfig.config.server.port).toBe(5959);
		expect(fresh.SettingConfig.config.other.browserSearchHistoryLimit).toBe(9);
	});

	it('目录写入失败（只读 HOME）时退回默认配置且不抛错', () => {
		const configDir = makeConfigDir();
		nodeFs.mkdirSync(nodePath.dirname(configDir), { recursive: true });
		// 用同名文件占住路径，mkdirSync 与 writeFileSync 都会失败
		nodeFs.writeFileSync(configDir, '', 'utf-8');

		expect(() => mod.SettingConfig.load()).not.toThrow();
		expect(mod.SettingConfig.config.server.port).toBe(5959);
		expect(nodeFs.statSync(configDir).isFile()).toBe(true);
	});

	it('已有配置只补齐缺失项，不覆盖用户值', () => {
		const configDir = makeConfigDir();
		nodeFs.mkdirSync(configDir, { recursive: true });
		nodeFs.writeFileSync(
			nodePath.join(configDir, 'yami-config.json'),
			JSON.stringify({ server: { port: 6000 } }),
			'utf-8'
		);

		mod.SettingConfig.load();

		expect(mod.SettingConfig.config.server.port).toBe(6000);
		expect(mod.SettingConfig.config.server.auto).toBe(false);
		expect(mod.SettingConfig.config.other.browserSearchHistoryLimit).toBe(9);
	});

	it('配置文件损坏时退回默认配置，且不覆盖原文件', () => {
		const configDir = makeConfigDir();
		const file = nodePath.join(configDir, 'yami-config.json');
		nodeFs.mkdirSync(configDir, { recursive: true });
		nodeFs.writeFileSync(file, '{ broken json', 'utf-8');

		expect(() => mod.SettingConfig.load()).not.toThrow();
		expect(mod.SettingConfig.config.server.port).toBe(5959);
		expect(nodeFs.readFileSync(file, 'utf-8')).toBe('{ broken json');
	});

	it('save() 在目录被清掉后补建目录并写入，不抛错', () => {
		const configDir = makeConfigDir();
		nodeFs.mkdirSync(configDir, { recursive: true });
		const file = nodePath.join(configDir, 'yami-config.json');
		nodeFs.writeFileSync(file, JSON.stringify({ server: { port: 6001 } }), 'utf-8');
		mod.SettingConfig.load();

		nodeFs.rmSync(configDir, { recursive: true, force: true });

		expect(() => mod.SettingConfig.save()).not.toThrow();
		expect(nodeFs.existsSync(file)).toBe(true);
	});

	it('save() 把内存中的当前配置落盘', () => {
		const configDir = makeConfigDir();
		nodeFs.mkdirSync(configDir, { recursive: true });
		const file = nodePath.join(configDir, 'yami-config.json');
		nodeFs.writeFileSync(file, JSON.stringify({ server: { port: 6001 } }), 'utf-8');
		mod.SettingConfig.load();

		mod.SettingConfig.config.server.port = 6100;
		mod.SettingConfig.save();

		expect(JSON.parse(nodeFs.readFileSync(file, 'utf-8')).server.port).toBe(6100);
	});
});

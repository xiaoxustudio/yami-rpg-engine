import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { getDataStore } from '@app/stores/data';
import { initUpdaterConfig } from '../config.ts';
import { Updater } from '../updater.ts';

/**
 * `updateConfig` 是**老工程升级**的第一道关卡：它把 1.0.54 → 1.0.127 之间的所有
 * config 结构变更跑一遍。这段代码原本 0% 覆盖，而改错会静默写坏用户工程数据。
 * 这里用一个「1.0.54 之前」的完整 config 跑全链路，逐条断言关键迁移结果。
 *
 * 老 config 的形状与新类型（`GameConfigShape`）本来就不同（font / event / actor.playerTeam
 * 这些字段已经不存在），所以统一按 `Record<string, unknown>` 读，不做双重断言。
 */
const asLegacy = (value: unknown): Record<string, unknown> => value as Record<string, unknown>;

function legacyData() {
	const events: Record<string, Record<string, unknown>> = {
		e1: {},
		e2: {},
		e3: {},
		e4: {},
		e5: {}
	};
	const config: Record<string, unknown> = {
		gameId: 'game1',
		font: { imports: ['a.ttf'], default: 'Arial' },
		collision: { trigger: null, actor: { ignoreTeamMember: true } },
		// 1.0.54 之前的老工程**没有** text 键（它由 font 重组而来）；
		// 若这里也放一个 text，循环里 `dConfig.text = sConfig.text` 会把它覆盖掉。
		resolution: {},
		localization: { languages: ['en', 'zh-CN'], default: 'auto' },
		window: { display: 'window' },
		actor: { playerTeam: 't1', playerActor: 'a1', partyMembers: [], partyInventory: [] },
		script: { language: 'ts', outDir: 'src', autoCompile: false },
		event: {
			startup: 'e1',
			loadGame: 'e2',
			initScene: 'e3',
			showText: 'e4',
			showChoices: 'e5'
		}
	};
	return {
		config,
		events,
		manifest: { changes: [] as unknown[], project: { config: 'config' } }
	};
}

function seed() {
	const legacy = legacyData();
	const store = getDataStore();
	store.setData('config', legacy.config as never);
	store.setData('events', legacy.events as never);
	// manifest 是访问器，走 setManifest 才是唯一入口
	store.setManifest(legacy.manifest as never);
	return legacy;
}

const currentConfig = (): Record<string, unknown> => asLegacy(getDataStore().data.config);

describe('updateConfig：老工程 config 升级链路', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		initUpdaterConfig();
	});

	it('1.0.54：font → text 结构重组，collision.trigger 补齐', () => {
		seed();
		Updater.updateConfig!(0);
		const config = currentConfig();
		const text = config.text as {
			importedFonts: string[];
			fontFamily: string;
			wordWrap?: string;
			highDefinition: boolean;
		};
		expect(text.importedFonts).toEqual(['a.ttf']);
		expect(text.fontFamily).toBe('Arial');
		// 1.0.54 先写 wordWrap:'break'，1.0.115 又把它删掉 —— 全链路跑完不该残留
		expect(text.wordWrap).toBeUndefined();
		expect(text.highDefinition).toBe(false);
		expect(config.font).toBeUndefined();
		expect((config.collision as { trigger: unknown }).trigger).toEqual({
			collideWithActorShape: false
		});
	});

	it('1.0.68 / 1.0.102 / 1.0.115：逐版本收口旧字段', () => {
		seed();
		Updater.updateConfig!(0);
		const config = currentConfig();
		const collision = config.collision as { actor: { ignoreTeamMember?: unknown } };
		expect(collision.actor.ignoreTeamMember).toBeUndefined();

		const resolution = config.resolution as { sceneScale: number; uiScale: number };
		expect(resolution.sceneScale).toBe(1);
		expect(resolution.uiScale).toBe(1);

		const localization = config.localization as {
			languages: { name: string; font: string; scale: number }[];
		};
		expect(localization.languages).toEqual([
			{ name: 'en', font: '', scale: 1 },
			{ name: 'zh-CN', font: '', scale: 1 }
		]);
	});

	it('1.0.122：事件类型回填、脚本/存档字段重建、旧 actor 字段删除', () => {
		const legacy = seed();
		Updater.updateConfig!(0);
		const config = currentConfig();
		expect(config.deployed).toBe(false);
		expect((config.window as { display: string }).display).toBe('windowed');
		expect(config.virtualAxis).toEqual({
			up: 'KeyW',
			down: 'KeyS',
			left: 'KeyA',
			right: 'KeyD'
		});
		expect(config.save).toEqual({ location: 'local', subdir: 'game1' });
		expect((config.script as { autoCompile: boolean }).autoCompile).toBe(true);
		expect((config.actor as { playerTeam?: unknown }).playerTeam).toBeUndefined();

		expect(legacy.events.e1.type).toBe('startup');
		expect(legacy.events.e2.type).toBe('loadsave');
		expect(legacy.events.e3.type).toBe('createscene');
		expect(legacy.events.e4.type).toBe('showtext');
		expect(legacy.events.e5.type).toBe('showchoices');
		expect(config.event).toBeUndefined();
	});

	it('1.0.127：webgl 滤镜默认值与 preload 补齐', () => {
		seed();
		Updater.updateConfig!(0);
		const config = currentConfig();
		expect(config.webgl).toEqual({
			desynchronized: false,
			textureMagFilter: 'nearest',
			textureMinFilter: 'linear'
		});
		expect(config.preload).toBe('never');
	});

	it('manifest.changes 只记一次 config 变更（重复调用不重复追加）', () => {
		const legacy = seed();
		Updater.updateConfig!(0);
		expect(legacy.manifest.changes).toEqual(['config']);
		Updater.updateConfig!(0);
		expect(legacy.manifest.changes).toEqual(['config']);
	});
});

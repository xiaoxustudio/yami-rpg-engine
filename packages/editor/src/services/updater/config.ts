import { getDataStore } from '@app/stores/data';
import { append } from '@app/utils/array';
import { Updater } from './updater.ts';

function updateConfig(verNum: number) {
	// 修改font属性为text属性
	if (verNum < Updater.getVersionNumber!('1.0.54')) {
		const sConfig = getDataStore().data.config!;
		const dConfig: Record<string, unknown> = {};
		for (const key of Object.keys(sConfig)) {
			if (key === 'font') {
				dConfig.text = {
					// `font` 是 1.0.54 之前的旧字段（`GameConfigShape` 里声明为可选）：
					// 这里正处在「它就是 font 那一轮」的分支里，缺失即旧配置损坏 —— `!` 保持原先的抛错语义
					importedFonts: sConfig.font!.imports,
					fontFamily: sConfig.font!.default,
					wordWrap: 'break'
				};
			} else {
				switch (key) {
					case 'collision':
						// 键就是 'collision'，用具名字段与原动态写法 `sConfig[key]` 等价（同样在缺失时抛）
						if (!sConfig.collision!.trigger) {
							sConfig.collision!.trigger = {
								collideWithActorShape: false
							};
						}
						break;
				}
				dConfig[key] = sConfig[key];
				switch (key) {
					case 'script':
						// 在script属性后添加localization属性
						if (!sConfig.localization) {
							dConfig.localization = {
								languages: ['en', 'zh-CN'],
								default: 'auto'
							};
						}
						break;
				}
			}
		}
		getDataStore().setData('config', dConfig);
		append(
			getDataStore().data.manifest!.changes as unknown[],
			getDataStore().data.manifest!.project.config
		);
	}
	if (verNum < Updater.getVersionNumber!('1.0.52')) {
		const config = getDataStore().data.config!;
		delete config.text.pixelated;
		delete config.text.threshold;
		append(
			getDataStore().data.manifest!.changes as unknown[],
			getDataStore().data.manifest!.project.config
		);
	}
	if (verNum < Updater.getVersionNumber!('1.0.68')) {
		const config = getDataStore().data.config!;
		delete config.collision!.actor!.ignoreTeamMember;
		append(
			getDataStore().data.manifest!.changes as unknown[],
			getDataStore().data.manifest!.project.config
		);
	}
	if (verNum < Updater.getVersionNumber!('1.0.102')) {
		const config = getDataStore().data.config!;
		config.resolution.sceneScale = 1;
		config.resolution.uiScale = 1;
		config.text.highDefinition = false;
		append(
			getDataStore().data.manifest!.changes as unknown[],
			getDataStore().data.manifest!.project.config
		);
	}
	// 修改localization.languages属性为对象
	if (verNum < Updater.getVersionNumber!('1.0.115')) {
		const config = getDataStore().data.config!;
		delete config.text.wordWrap;
		const { languages } = config.localization!;
		for (let i = 0; i < languages.length; i++) {
			// 先取到局部量再判型：`typeof languages[i] === 'string'` 会把**下标表达式**
			// 收窄成 `string`，赋值目标也跟着变窄 ⇒ 写入对象会报「不能把对象赋给 string」。
			// 语义与原先逐字相同（字符串形态升级成 `LanguageSettingsShape`）。
			const entry = languages[i];
			if (typeof entry === 'string') {
				languages[i] = {
					name: entry,
					font: '',
					scale: 1
				};
			}
		}
		append(
			getDataStore().data.manifest!.changes as unknown[],
			getDataStore().data.manifest!.project.config
		);
	}
	// 修改window.display的值: 'window'->'windowed'
	if (verNum < Updater.getVersionNumber!('1.0.122')) {
		const { config, events } = getDataStore().data;
		if (config!.deployed === undefined) {
			config!.deployed = false;
		}
		if (config!.window.display === 'window') {
			config!.window.display = 'windowed';
		}
		if (!config!.virtualAxis) {
			config!.virtualAxis = {
				up: 'KeyW',
				down: 'KeyS',
				left: 'KeyA',
				right: 'KeyD'
			};
		}
		delete config!.actor.playerTeam;
		delete config!.actor.playerActor;
		delete config!.actor.partyMembers;
		delete config!.actor.partyInventory;
		if (config!.webgl === undefined) {
			config!.webgl = { desynchronized: false };
		}
		delete config!.script.language;
		delete config!.script.outDir;
		config!.script.autoCompile = true;
		config!.save = {
			location: 'local',
			subdir: config!.gameId
		};
		if (config!.event) {
			const { startup, loadGame, initScene, showText, showChoices } = config!.event;
			if (events![startup]) {
				events![startup].type = 'startup';
			}
			if (events![loadGame]) {
				events![loadGame].type = 'loadsave';
			}
			if (events![initScene]) {
				events![initScene].type = 'createscene';
			}
			if (events![showText]) {
				events![showText].type = 'showtext';
			}
			if (events![showChoices]) {
				events![showChoices].type = 'showchoices';
			}
			delete config!.event;
		}
		append(
			getDataStore().data.manifest!.changes as unknown[],
			getDataStore().data.manifest!.project.config
		);
	}
	if (verNum < Updater.getVersionNumber!('1.0.127')) {
		const { config } = getDataStore().data;
		if (config!.webgl.textureMagFilter === undefined) {
			config!.webgl = {
				desynchronized: config!.webgl.desynchronized,
				textureMagFilter: 'nearest',
				textureMinFilter: 'linear'
			};
		}
		if (config!.preload === undefined) {
			config!.preload = 'never';
		}
		append(
			getDataStore().data.manifest!.changes as unknown[],
			getDataStore().data.manifest!.project.config
		);
	}
}

export function initUpdaterConfig(): void {
	Updater.updateConfig = updateConfig;
}

import { serviceEls } from '@app/services/element-registry';
import { on } from '@app/utils/element-utils.ts';
import { GlobalPathForDir, GlobalPath } from '@app/utils/config';

import { WebServer } from '@app/services/ipc/webserver.ts';
import nodeFs from 'node:fs';
import nodePath from 'node:path';
import { SettingRenderer } from './renderer.ts';
import { settingSchema, buildDefaultConfig } from './schema.ts';
import type { SettingConfigShape } from './types.ts';
import type { YamiElement } from '@app/types/element-api';

export const path = nodePath;

export const SettingConfig = new (class {
	config: SettingConfigShape = {} as SettingConfigShape;
	private _rendered = false;
	private _localizeBound = false;
	private renderer = new SettingRenderer(this, settingSchema);

	get homedir() {
		return GlobalPathForDir;
	}
	get configPath() {
		return typeof path.join === 'function' ? path.join(GlobalPath, 'yami-config.json') : '';
	}
	get defaultConfig(): Record<string, unknown> {
		return buildDefaultConfig(settingSchema);
	}
	private get defaultConfigClone(): SettingConfigShape {
		return JSON.parse(JSON.stringify(this.defaultConfig));
	}

	// 首次启动 / CI 干净 HOME 下 `.openyami` 目录并不存在，必须先建目录再写文件，
	// 否则 writeFileSync 直接抛 ENOENT。目录不可写时也只退回默认配置，绝不抛出——
	// 本模块在 import 期实例化，构造抛出会连带整个依赖它的模块图加载失败。
	private ensureConfigDir(): boolean {
		const dir = typeof path.dirname === 'function' ? path.dirname(this.configPath) : '';
		if (!dir) return false;
		try {
			nodeFs.mkdirSync(dir, { recursive: true });
			return true;
		} catch {
			return false;
		}
	}

	private writeConfigFile(data: unknown): boolean {
		if (!this.ensureConfigDir()) return false;
		try {
			nodeFs.writeFileSync(this.configPath, JSON.stringify(data), 'utf-8');
			return true;
		} catch {
			return false;
		}
	}

	constructor() {
		this.load();
		if (typeof document === 'undefined') return;
		this.bindButtons();
		if (!this._buttonsBound) {
			const observer = new MutationObserver(() => {
				if (!this._buttonsBound) this.bindButtons();
				if (this._buttonsBound) observer.disconnect();
			});
			observer.observe(document.documentElement, { childList: true, subtree: true });
		}
	}

	private _buttonsBound = false;
	private bindButtons() {
		if (this._buttonsBound) return;
		if (typeof document === 'undefined') return;
		const settingEl = serviceEls.get('setting') as YamiElement;
		if (!settingEl) return;
		this._buttonsBound = true;
		on(settingEl, 'open', this.open.bind(this));
	}

	open() {
		this.bindButtons();
		this.load();
		this.render();
		on(serviceEls.get('setting') as YamiElement, 'closed', () => this.close(), { once: true });
	}
	close() {
		this.save();
	}

	private render() {
		this.renderer.render();
		this._rendered = true;
		if (!this._localizeBound) {
			this._localizeBound = true;
			window.addEventListener('localize', () => {
				if (!this._rendered) return;
				this.renderer.applyL10n();
				void this.renderer.reloadAllSelectOptions();
			});
		}
	}

	load() {
		if (typeof nodeFs.existsSync !== 'function') {
			this.config = this.defaultConfigClone;
			return;
		}
		if (!this.configPath) {
			this.config = this.defaultConfigClone;
			return;
		}
		if (!nodeFs.existsSync(this.configPath)) {
			this.writeConfigFile(this.defaultConfig);
			this.config = this.defaultConfigClone;
			return;
		}
		let stored: unknown;
		try {
			stored = JSON.parse(nodeFs.readFileSync(this.configPath, 'utf-8'));
		} catch {
			// 文件不可读或 JSON 损坏：退回默认配置，不覆盖用户的文件
			this.config = this.defaultConfigClone;
			return;
		}
		if (stored === null || typeof stored !== 'object' || Array.isArray(stored)) {
			this.config = this.defaultConfigClone;
			return;
		}
		this.config = stored as SettingConfigShape;
		const patch = (
			_p_obj: Record<string, unknown>,
			_t_obj: Record<string, unknown>
		): Record<string, unknown> => {
			if (_t_obj === null || typeof _t_obj !== 'object') {
				_t_obj = {};
			}
			for (const key in _p_obj) {
				if (!Reflect.has(_t_obj, key)) {
					_t_obj[key] = _p_obj[key];
				}
				if (typeof _p_obj[key] === 'object') {
					_t_obj[key] = patch(
						_p_obj[key] as Record<string, unknown>,
						_t_obj[key] as Record<string, unknown>
					);
				}
			}
			return _t_obj;
		};
		this.config = patch(this.defaultConfig, this.config) as SettingConfigShape;
		for (const key of Object.keys(this.defaultConfig)) {
			this.config[key] ??= {};
			const defaultSection = this.defaultConfig[key] as Record<string, unknown>;
			for (const sub of Object.keys(defaultSection)) {
				if (this.config[key][sub] === undefined) {
					this.config[key][sub] = defaultSection[sub];
				}
			}
		}
		const browserSearchHistoryLimit = Math.floor(
			Number(this.config.other.browserSearchHistoryLimit)
		);
		this.config.other.browserSearchHistoryLimit = Number.isFinite(browserSearchHistoryLimit)
			? Math.min(Math.max(browserSearchHistoryLimit, 1), 9)
			: 9;
	}
	save() {
		if (!this.configPath) return;
		if (!nodeFs.existsSync(this.configPath)) {
			this.writeConfigFile(this.defaultConfig);
			return;
		}
		this.writeConfigFile(this.config);
		this.apply();
	}
	apply() {
		if (WebServer.port !== this.config.server.port) {
			WebServer.port = this.config.server.port;
		}
	}
})();

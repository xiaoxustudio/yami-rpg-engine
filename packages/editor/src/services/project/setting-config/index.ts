import { serviceEls } from '@app/services/element-registry';
import { on } from '@app/utils/element-utils.ts';
import { GlobalPathForDir, GlobalPath } from '@app/utils/config';

import { WebServer } from '@app/services/ipc/webserver.ts';
import nodeFs from 'node:fs';
import nodePath from 'node:path';
import { SettingRenderer } from './renderer.ts';
import { settingSchema, buildDefaultConfig } from './schema.ts';

export const path = nodePath;

export const SettingConfig = new (class {
	// oxlint-disable-next-line no-explicit-any
	config: Record<string, any> = {};
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
		const settingEl = serviceEls.get('setting') as HTMLElement;
		if (!settingEl) return;
		this._buttonsBound = true;
		on(settingEl, 'open', this.open.bind(this));
		// confirm 由 Setting.vue 的 @confirm 驱动（按钮由 WindowFrame 生成，注册表取不到）
	}

	open() {
		this.bindButtons();
		this.load();
		this.render();
		on(serviceEls.get('setting') as HTMLElement, 'closed', () => this.close(), { once: true });
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
			this.config = JSON.parse(JSON.stringify(this.defaultConfig));
			return;
		}
		if (!nodeFs.existsSync(this.configPath)) {
			nodeFs.writeFileSync(this.configPath, JSON.stringify(this.defaultConfig), 'utf-8');
			this.config = JSON.parse(JSON.stringify(this.defaultConfig));
			return;
		}
		this.config = JSON.parse(nodeFs.readFileSync(this.configPath, 'utf-8'));
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
		this.config = patch(this.defaultConfig, this.config);
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
		if (!nodeFs.existsSync(this.configPath)) {
			return nodeFs.writeFileSync(
				this.configPath,
				JSON.stringify(this.defaultConfig),
				'utf-8'
			);
		}
		nodeFs.writeFileSync(this.configPath, JSON.stringify(this.config), 'utf-8');
		this.apply();
	}
	apply() {
		if (WebServer.port !== this.config.server.port) {
			WebServer.port = this.config.server.port;
		}
	}
})();

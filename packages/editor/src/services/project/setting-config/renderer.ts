import { serviceEls } from '@app/services/element-registry';
import { addClass, on, removeClass, setTooltip, write } from '@app/utils/element-utils.ts';
import { setLocalElement } from '@app/localize/dom-localizer';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getLocalStore } from '@app/stores/local';
import { ApkBuilder } from '@app/module/apkbuilder.ts';
import type { SettingOption, SettingSection } from './types.ts';
import type { YamiElement } from '@app/types/element-api';

export interface SettingHost {
	config: Record<string, unknown>;
}

export class SettingRenderer {
	constructor(
		private host: SettingHost,
		private schema: SettingSection[]
	) {}

	private titleId(sectionPath: string[]) {
		return `setting-title-${sectionPath.join('-')}`;
	}
	private optionId(sectionPath: string[], opt: SettingOption) {
		return opt.id ?? `setting-${[...sectionPath, opt.key].join('-')}`;
	}
	private readConfig(sectionPath: string[], optKey: string): unknown {
		let v: unknown = this.host.config;
		for (const p of sectionPath) v = (v as Record<string, unknown> | undefined)?.[p];
		return (v as Record<string, unknown> | undefined)?.[optKey];
	}
	private writeConfig(sectionPath: string[], optKey: string, value: string | number | boolean) {
		let v: Record<string, unknown> = this.host.config;
		for (const p of sectionPath) {
			if (v[p] == null || typeof v[p] !== 'object') v[p] = {};
			v = v[p] as Record<string, unknown>;
		}
		v[optKey] = value;
	}
	private forAllOptions(fn: (sectionPath: string[], opt: SettingOption) => void) {
		const walk = (sections: SettingSection[], basePath: string[]) => {
			for (const s of sections) {
				const path = [...basePath, s.id];
				for (const o of s.options) {
					if (!o.hidden) fn(path, o);
				}
				if (s.subgroups) walk(s.subgroups, path);
			}
		};
		walk(this.schema, []);
	}

	render() {
		this.applyL10n();
		this.bindAllOnce();
		this.forAllOptions((sectionPath, opt) => {
			if (opt.type === 'select') {
				void this.loadSelectOptions(sectionPath, opt);
			} else {
				this.writeValue(sectionPath, opt);
			}
		});
	}

	private _eventsBound = false;
	private bindAllOnce() {
		if (this._eventsBound) return;
		this._eventsBound = true;
		this.forAllOptions((sectionPath, opt) => this.bindOption(sectionPath, opt));
	}

	applyL10n() {
		const get = (key: string) => t('confirmation.' + key);
		const components = getLocalStore().components ?? {};
		const localize = (sections: SettingSection[], basePath: string[]) => {
			for (const section of sections) {
				const path = [...basePath, section.id];
				const titleEl = this.byId(this.titleId(path));
				if (titleEl) {
					if (section.titleKey) {
						titleEl.textContent = get(section.titleKey) || section.titleFallback || '';
					} else if (components[titleEl.id]) {
						setLocalElement(titleEl, components[titleEl.id]);
					}
				}
				for (const opt of section.options) {
					if (opt.hidden) continue;
					const id = this.optionId(path, opt);
					const el = this.byId(id);
					if (!el) continue;
					if (opt.labelKey) {
						const labelEl = this.byId(opt.labelId ?? id + '-label');
						if (labelEl)
							labelEl.textContent = get(opt.labelKey) || opt.labelFallback || '';
					} else if (components[id]) {
						setLocalElement(el, components[id]);
					}
				}
				if (section.subgroups) localize(section.subgroups, path);
			}
		};
		localize(this.schema, []);
	}

	/**
	 * 设置项一律在**设置窗口帧内**查找。
	 */
	private byId(id: string): YamiElement | null {
		if (id === '') return null;
		const frame = serviceEls.get('setting') as HTMLElement | undefined;
		return (frame?.querySelector(`#${CSS.escape(id)}`) as YamiElement | null) ?? null;
	}

	private bindOption(sectionPath: string[], opt: SettingOption) {
		const el = this.byId(this.optionId(sectionPath, opt));
		if (!el) return;
		on(el, 'input', (e: Event & { value?: unknown }) => {
			const value = this.readValue(e);
			this.writeConfig(sectionPath, opt.key, value);
			if (opt.validate) this.showValidation(el, opt.validate(value, this.host.config));
			if (opt.onChange) opt.onChange(value, this.host.config);
		});
		if (opt.tooltipPath) {
			on(el, 'mouseenter', () => {
				setTooltip(
					el,
					ApkBuilder.processPathOnly(this.readConfig(sectionPath, opt.key) as string)
				);
			});
		}
	}

	private readValue(e: Event & { value?: unknown }): string | number | boolean {
		if (e.target && Reflect.has(e.target, 'value'))
			return Reflect.get(e.target, 'value') as string | number | boolean;
		return e.value as string | number | boolean;
	}

	private writeValue(sectionPath: string[], opt: SettingOption) {
		const el = this.byId(this.optionId(sectionPath, opt));
		if (!el) return;
		write(el, this.readConfig(sectionPath, opt.key));
	}

	private async loadSelectOptions(sectionPath: string[], opt: SettingOption) {
		if (!opt.optionsFn) return;
		const el = this.byId(this.optionId(sectionPath, opt));
		if (!el) return;
		const get = (key: string) => t('confirmation.' + key);
		const items = await opt.optionsFn({ get, config: this.host.config });
		el.loadItems(items);
		write(el, this.readConfig(sectionPath, opt.key));
	}

	private showValidation(el: HTMLElement, error: string | null) {
		if (error) {
			addClass(el, 'invalid');
		} else {
			removeClass(el, 'invalid');
		}
	}

	async reloadAllSelectOptions() {
		const tasks: Promise<void>[] = [];
		this.forAllOptions((sectionPath, opt) => {
			if (opt.type === 'select') {
				tasks.push(this.loadSelectOptions(sectionPath, opt));
			}
		});
		await Promise.all(tasks);
	}
}

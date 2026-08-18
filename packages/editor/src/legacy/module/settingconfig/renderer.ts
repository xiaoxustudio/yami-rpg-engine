import { $ } from '@app/legacy/util/dom.ts';
import { addClass, on, removeClass, setTooltip, write } from '@app/legacy/util/element-utils.ts';
import { Local } from '@app/legacy/tools/localization.ts';
import { createGetter } from '@app/i18n';
import { ApkBuilder } from '../apkbuilder.ts';
import type { SettingOption, SettingSection } from './types.ts';

/** 渲染引擎宿主：提供当前 config。load() 后 config 会被重新赋值，故用属性访问而非捕获引用 */
export interface SettingHost {
	config: Record<string, unknown>;
}

/**
 * 设置渲染引擎：根据 schema 动态生成 UI、绑定事件、写入值、加载下拉项、应用本地化。
 *
 * 通过 host.config 读写配置 —— host.config 在 load() 后会被整体重新赋值，
 * 因此引擎始终通过属性访问获取最新引用，避免持有过期 config。
 */
export class SettingRenderer {
	constructor(
		private host: SettingHost,
		private schema: SettingSection[]
	) {}

	// ---- 路径与 id 计算 ----

	/** 计算标题 DOM id：setting-title-{sectionPath.join('-')} */
	private titleId(sectionPath: string[]) {
		return `setting-title-${sectionPath.join('-')}`;
	}
	/** 计算选项 DOM id：默认 setting-{sectionPath...}-{key} */
	private optionId(sectionPath: string[], opt: SettingOption) {
		return opt.id ?? `setting-${[...sectionPath, opt.key].join('-')}`;
	}
	/** 按 sectionPath 读取 config 中该选项的值 */
	private readConfig(sectionPath: string[], optKey: string): unknown {
		let v: unknown = this.host.config;
		for (const p of sectionPath) v = (v as Record<string, unknown> | undefined)?.[p];
		return (v as Record<string, unknown> | undefined)?.[optKey];
	}
	/** 按 sectionPath 写入 config 中该选项的值 */
	private writeConfig(sectionPath: string[], optKey: string, value: string | number | boolean) {
		let v: Record<string, unknown> = this.host.config;
		for (const p of sectionPath) {
			if (v[p] == null || typeof v[p] !== 'object') v[p] = {};
			v = v[p] as Record<string, unknown>;
		}
		v[optKey] = value;
	}
	/** 遍历所有非 hidden 选项（含嵌套子分组），回调收到 (sectionPath, opt) */
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

	// ---- 渲染 ----

	/** 渲染：设置窗口控件由 Setting.vue 静态提供，此处只做本地化、绑定事件与写入值 */
	render() {
		// 1. 应用本地化（标题/标签/提示）
		this.applyL10n();

		// 2. 首次绑定事件（控件生命周期由 Vue 管理，事件不得重复绑定）
		this.bindAllOnce();

		// 3. 写入当前值（select 项异步加载）
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

	// ---- 本地化 ----

	/** 应用本地化：标题、命名标签、components 标签/提示 */
	applyL10n() {
		const get = createGetter('confirmation');
		const components = Local.components ?? {};
		const localize = (sections: SettingSection[], basePath: string[]) => {
			for (const section of sections) {
				const path = [...basePath, section.id];
				const titleEl = $(`#${this.titleId(path)}`);
				if (titleEl) {
					if (section.titleKey) {
						titleEl.textContent = get(section.titleKey) || section.titleFallback || '';
					} else if (components[titleEl.id]) {
						// components 项含 content：setElement 写入 textContent
						Local.setElement!(titleEl, components[titleEl.id]);
					}
				}
				for (const opt of section.options) {
					if (opt.hidden) continue;
					const id = this.optionId(path, opt);
					const el = $(`#${id}`);
					if (!el) continue;
					if (opt.labelKey) {
						const labelEl = $(`#${opt.labelId ?? id + '-label'}`);
						if (labelEl)
							labelEl.textContent = get(opt.labelKey) || opt.labelFallback || '';
					} else if (components[id]) {
						// components 项含 label/tip：setElement 把 label 写入前一个兄弟 .text，tip 写入控件 tooltip
						Local.setElement!(el, components[id]);
					}
				}
				if (section.subgroups) localize(section.subgroups, path);
			}
		};
		localize(this.schema, []);
	}

	// ---- 事件绑定 ----

	/** 绑定输入事件：读取值 → 更新 config → 校验 → 变更回调；并绑定动态路径提示 */
	private bindOption(sectionPath: string[], opt: SettingOption) {
		const el = document.querySelectorAll(
			`#${this.optionId(sectionPath, opt)}`
		)[0] as HTMLElement;
		if (!el) return;
		on(el, 'input', (e: Event & { value?: unknown }) => {
			const value = this.readValue(e);
			this.writeConfig(sectionPath, opt.key, value);
			if (opt.validate) this.showValidation(el, opt.validate(value, this.host.config));
			if (opt.onChange) opt.onChange(value, this.host.config);
		});
		// 动态路径提示：悬停时用 ApkBuilder.processPathOnly 解析后路径覆盖静态 tip
		if (opt.tooltipPath) {
			on(el, 'mouseenter', () => {
				setTooltip(
					el,
					ApkBuilder.processPathOnly(this.readConfig(sectionPath, opt.key) as string)
				);
			});
		}
	}

	/**
	 * 读取事件值：
	 * - text/number 控件的 input 事件由内部 <input> 冒泡，e.target.value 为字符串
	 * - checkbox/select 在元素上派发，e.value 为实际值
	 */
	private readValue(e: Event & { value?: unknown }): string | number | boolean {
		if (e.target && Reflect.has(e.target, 'value'))
			return (e.target as unknown as { value: string | number | boolean }).value;
		return e.value as string | number | boolean;
	}

	/** 写入当前 config 值到控件 */
	private writeValue(sectionPath: string[], opt: SettingOption) {
		const el = document.querySelectorAll(
			`#${this.optionId(sectionPath, opt)}`
		)[0] as HTMLElement;
		if (!el) return;
		write(el, this.readConfig(sectionPath, opt.key));
	}

	/** 加载 select 选项并回写当前值（optionsFn 可异步） */
	private async loadSelectOptions(sectionPath: string[], opt: SettingOption) {
		if (!opt.optionsFn) return;
		const el = document.querySelectorAll(
			`#${this.optionId(sectionPath, opt)}`
		)[0] as HTMLElement;
		if (!el) return;
		const get = createGetter('confirmation');
		const items = await opt.optionsFn({ get, config: this.host.config });
		el.loadItems(items);
		write(el, this.readConfig(sectionPath, opt.key));
	}

	/** 校验结果可视化：错误时加 invalid 类，通过则移除 */
	private showValidation(el: HTMLElement, error: string | null) {
		if (error) {
			addClass(el, 'invalid');
		} else {
			removeClass(el, 'invalid');
		}
	}

	/** 重新加载所有下拉项（语言切换后调用，选项名称可能含 i18n 文案） */
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

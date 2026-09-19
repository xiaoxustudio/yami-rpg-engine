import { getListConfig, setTreeItemClass, treeOwnerListOf, type ListConfig } from '@ui-kit';
import { Command } from '@app/commands/command-object.ts';
import { Data } from '@app/data/data-object.ts';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { ParamHistory } from '@app/composables/useParamHistory';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { IListInterface } from '@app/types/list-interface.ts';
import { HistoryData, IEditableHistory } from '@app/types/history.ts';
import type { YamiElement, YamiElementApi } from '@app/types/element-api';

interface EventListTargetShape {
	guid?: string;
	presetId?: string;
	events?: unknown;
	element?: YamiElement | null;
}

interface EventListEventShape {
	type: string;
	enabled: boolean;
}

interface EventListDom extends HTMLElement, YamiElementApi {
	inserting?: boolean;
	/**
	 * 事件列表（树列表）元素的虚拟窗口起点/终点。
	 *
	 * **⚠️ 2026-09-16 记录（P4c 第二刀发现）**：T5b 之后树列表的窗口起点已由
	 * `renderState.start/end`（`tree-render.ts` 的 ref）承载，**元素上这两个属性没有任何写入方**
	 * （`module/editdata.ts` 也按同样方式读 `start`/`end`）⇒ 这里的 `list.start!--` 运行期读到的是
	 * `undefined`（自增后成 `NaN`，随后 `select(NaN + 1)` 静默落空）。本刀**只做类型化**（保持与
	 * 迁移前逐字一致的行为），"是否应改读 `renderState`"作为独立问题登记在
	 * 迁移收尾清单 的 P4c 小节，待有真机/用例覆盖时再动。
	 */
	start?: number;
	end?: number;
}

const FILTER_BY_LIST_ID: Record<string, string> = {
	'fileActor-events': 'actor',
	'sceneActor-events': 'actor',
	'fileSkill-events': 'skill',
	'fileState-events': 'state',
	'fileEquipment-events': 'equipment',
	'fileItem-events': 'item',
	'fileTrigger-events': 'trigger',
	'fileScene-events': 'scene',
	'fileAnimation-events': 'animation',
	'sceneAnimation-events': 'animation',
	'sceneLight-events': 'light',
	'sceneParallax-events': 'parallax',
	'sceneParticle-events': 'particle',
	'sceneRegion-events': 'region',
	'sceneTilemap-events': 'tilemap',
	'uiElement-events': 'element'
};

/**
 * list 配置 + 我们挂上去的本地化监听引用。
 *
 * `getListConfig()` 内部是 `WeakMap<object, ListConfig>`，返回的是**同一个对象**，
 * 所以把监听器存上去既能跨多次 `initialize()` 复用，又随元素被回收而自然失效，
 * 不需要额外的清理表。
 */
type ListConfigWithLocalize = ListConfig & { localizeListener?: () => void };

export class EventListInterface implements IListInterface {
	target!: HTMLElement | null;
	type!: string;
	filter!: string;
	editor!: { target?: unknown } | null;
	owner!: { history?: unknown } | null;
	eventItem!: Record<string, unknown> | null;
	editCallback!: (() => void) | null;
	insertCallback!: (() => void) | null;
	history!: IEditableHistory | null;

	constructor(editor?: unknown, owner?: unknown) {
		this.editor = (editor as { target?: unknown } | null) ?? null;
		this.owner = (owner as { history?: unknown } | null) ?? null;
	}

	initialize(list: EventListDom): void {
		getListConfig(list).togglable = true;
		this.filter = list.getAttribute('filter') ?? FILTER_BY_LIST_ID[list.id] ?? 'global';
		this.type = `${this.filter}.event`;
		this.editCallback = () => list.save();
		this.insertCallback = () => {
			if (list.inserting) {
				list.save();
				list.inserting = false;
			} else {
				list.start!--;
				list.save();
				list.select(list.start! + 1);
			}
		};

		const { editor, owner } = this;
		if (editor && owner) {
			this.history = new ParamHistory(editor, owner, list) as unknown as IEditableHistory;
			// oxlint-disable-next-line unbound-method
			this.history!.save = EventListInterface.historySave;
		}

		// 本地化监听：**幂等注册**。
		//
		// 原先这里是 `window.addEventListener('localize', () => { … })`，一块匿名箭头函数、
		// 一个实例注册一份、且从不摘除。而检查器有 15 个页面各自 `new EventListInterface(...)`
		// 后调 `initialize()`，每进一次页面就多挂一份到 `window` 上——切换页面/语言时这些
		// 陈旧监听会被全部触发，属于真实的累积泄漏（`scripts/migration-ledger.mjs` 的
		// unremovable-listeners 轴把它和进程级常驻监听混在一起，所以那轴只要求不增，见其注释）。
		//
		// 修法：把监听存进**该元素自己的** list 配置里（`getListConfig` 是 WeakMap + 元素数据，
		// 天然随元素共存亡），重复 `initialize()` 时先摘掉上一份再挂新的 ⇒ 同一元素恒为 1 份。
		// 这样不需要给 15 个页面的组件生命周期都加上 dispose 调用，也就不引入卸载时序风险。
		const config = getListConfig(list) as ListConfigWithLocalize;
		if (config.localizeListener) {
			window.removeEventListener('localize', config.localizeListener);
		}
		config.localizeListener = () => {
			if (list.data) list.update();
		};
		window.addEventListener('localize', config.localizeListener);
	}

	parse(event: EventListEventShape) {
		const { type } = event;
		if (EventListInterface.guidRegExp.test(type)) {
			Command.invalid = false;
			const groupKey = this.filter + '-event';
			const eventType = Command.parseGroupEnumString!(groupKey, type);
			const eventClass = Command.invalid ? 'invalid' : event.enabled ? '' : 'weak';
			return {
				content: Command.removeTextTags!(eventType),
				class: eventClass
			};
		}
		return {
			content: t('eventTypes.' + type),
			class: event.enabled ? '' : 'weak'
		};
	}

	update(list: YamiElement) {
		const items = list.read();
		const length = items.length;
		if (length !== 0) {
			const flags = {} as Record<string, boolean>;
			for (let i = length - 1; i >= 0; i--) {
				const { type } = items[i];
				if (flags[type]) {
					setTreeItemClass(items[i], 'weak', true);
				} else {
					flags[type] = true;
				}
			}
		}

		const item = this.editor?.target as EventListTargetShape | undefined;
		if (item?.events === list.read()) {
			// 步骤 4：按 item 反查所属列表（不再依赖 element.parentNode）
			const owner = treeOwnerListOf(item) as { update?: () => void } | undefined;
			owner?.update?.();
		}
	}

	open(event?: EventListEventShape) {
		const filter = this.filter;
		let callback = this.editCallback;
		let inserting = false;
		if (event === undefined) {
			event = Inspector.fileEvent.create(filter);
			callback = this.insertCallback;
			inserting = true;
		}
		const target = this.editor!.target as EventListTargetShape;
		if (target.guid) {
			const id = target.guid;
			const fileName = Data.manifest.guidMap[id]?.file.basename;
			this.eventItem = EventEditor.openLocalEvent!(
				inserting,
				filter,
				fileName,
				event,
				callback
			);
		} else if (target.presetId) {
			const id = target.presetId;
			const preset = Data.scenePresets[id] ?? Data.uiPresets[id];
			if (preset) {
				const rootId = preset.sceneId ?? preset.uiId;
				const rootName = Data.manifest.guidMap[rootId]?.file.basename;
				const eventName = `${rootName}.${preset.data.name}`;
				this.eventItem = EventEditor.openLocalEvent!(
					inserting,
					filter,
					eventName,
					event,
					callback
				);
			}
		}
	}

	save() {
		return EventEditor.save!(this.eventItem);
	}

	static guidRegExp = /^[0-9a-f]{16}$/;

	static historySave(data: HistoryData) {
		ParamHistory.prototype.save.call(this, data as never);
		if (data.type === 'inspector-param-replace') {
			delete data.swap.commands.symbol;
		}
	}
}

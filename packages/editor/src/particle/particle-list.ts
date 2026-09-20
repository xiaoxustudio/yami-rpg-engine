import { Particle } from './particle-window.ts';
import type { ParticleShape } from './particle-window.ts';
import { getListConfig } from '@ui-kit';
import { Menu } from '@app/components/menu-list.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { Inspector } from '@app/inspector/inspector.ts';
import { ctrl } from '@app/utils/event-accessors';
import { read, write } from '@app/utils/element-utils.ts';
import type { GlobalClipboardHost } from '@app/utils/clipboard';
import { GlobalClipboard } from '@app/utils/clipboard';
import type { YamiEvent, YamiMouseEvent } from '@app/types/editor-event';

Particle.listKeydown = function (this: ParticleShape['list'], event: KeyboardEvent) {
	if (!this.data) {
		return;
	}
	const item = read(this);
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyX':
				this.copy(item);
				this.delete(item);
				break;
			case 'KeyC':
				this.copy(item);
				break;
			case 'KeyV':
				this.paste();
				break;
		}
	} else {
		switch (event.code) {
			case 'Delete':
				this.delete(item);
				break;
			case 'Escape':
				Particle.setTarget!(null);
				break;
		}
	}
};

Particle.listSelect = function (event: YamiEvent) {
	Particle.setTarget!(event.value);
};

Particle.listRecord = function (event: YamiEvent) {
	const response = event.value;
	switch (response.type) {
		case 'rename': {
			const editor = Inspector.particleLayer;
			const input = editor.nameBox;
			const { item, oldValue, newValue } = response;
			write(input, newValue);
			Particle.updateParticleInfo!();
			Particle.requestRendering!();
			Particle.history!.save({
				type: 'inspector-change',
				editor: editor,
				target: item,
				changes: [
					{
						input,
						oldValue,
						newValue
					}
				]
			});
			break;
		}
		case 'create':
			Particle.history!.save({
				type: 'particle-layer-create',
				response: response
			});
			break;
		case 'delete':
			Particle.history!.save({
				type: 'particle-layer-delete',
				response: response
			});
			break;
		case 'remove':
			Particle.history!.save({
				type: 'particle-layer-remove',
				response: response
			});
			break;
	}
};

Particle.listPopup = function (this: ParticleShape['list'], event: YamiMouseEvent) {
	const item = event.value;
	const get = (key: string) => t('menuParticleList.' + key);
	let copyable;
	let pastable;
	let deletable;
	let renamable;
	if (item) {
		copyable = true;
		pastable = (GlobalClipboard as GlobalClipboardHost).has('yami.particle.layer');
		deletable = true;
		renamable = true;
	} else {
		copyable = false;
		pastable = (GlobalClipboard as GlobalClipboardHost).has('yami.particle.layer');
		deletable = false;
		renamable = false;
	}
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		[
			{
				label: get('insert'),
				click: () => {
					this.create(item);
				}
			},
			{
				type: 'separator'
			},
			{
				label: get('cut'),
				accelerator: ctrl('X'),
				enabled: copyable,
				click: () => {
					this.copy(item);
					this.delete(item);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: copyable,
				click: () => {
					this.copy(item);
				}
			},
			{
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: pastable,
				click: () => {
					this.paste(item);
				}
			},
			{
				label: get('delete'),
				accelerator: 'Delete',
				enabled: deletable,
				click: () => {
					this.delete(item);
				}
			},
			{
				label: get('rename'),
				accelerator: 'F2',
				enabled: renamable,
				click: () => {
					this.rename(item);
				}
			}
		]
	);
};

Particle.listChange = function (_event: YamiEvent) {
	Particle.planToSave!();
};

// 列表 - 创建
Particle.list.create = function (dItem) {
	this.addNodeTo(Inspector.particleLayer.create(), dItem);
};

// 列表 - 复制
Particle.list.copy = function (item) {
	if (item) {
		(GlobalClipboard as GlobalClipboardHost).write('yami.particle.layer', item);
	}
};

// 列表 - 粘贴
Particle.list.paste = function (dItem) {
	const copy = (GlobalClipboard as GlobalClipboardHost).read('yami.particle.layer');
	if (copy && this.data) {
		this.addNodeTo(copy, dItem);
	}
};

// 列表 - 删除
Particle.list.delete = function (item) {
	if (item) {
		this.deleteNode(item);
	}
};

// 列表 - 在创建数据时回调
getListConfig(Particle.list).onCreate = function () {
	Particle.emitter!.updateLayers();
	Particle.computeOuterRect!();
	Particle.requestRendering!();
};

// 列表 - 在迁移数据时回调
getListConfig(Particle.list).onRemove = function () {
	Particle.emitter!.updateLayers();
	Particle.requestRendering!();
};

// 列表 - 在删除数据时回调
getListConfig(Particle.list).onDelete = function () {
	Particle.updateTarget!();
	Particle.emitter!.updateLayers();
	Particle.emitter!.active = false;
	Particle.emitter!.selected = false;
	Particle.computeOuterRect!();
	Particle.requestRendering!();
};

// 列表 - 在恢复数据时回调
getListConfig(Particle.list).onResume = function () {
	Particle.emitter!.updateLayers();
	Particle.computeOuterRect!();
	Particle.requestRendering!();
};

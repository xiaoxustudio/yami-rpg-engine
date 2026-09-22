<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
	YMButton,
	YMMenuList,
	YMParamList,
	ParamListHistory,
	type MenuItem,
	type MenuOptions
} from '@ui-kit';

interface ParamItem {
	name: string;
	value: number;
	enabled?: boolean;
}

interface ParamListElement extends HTMLElement {
	object: { type: string };
	togglable: boolean;
	bind(object: unknown): HTMLElement;
	write(data: unknown[]): void;
	read(): unknown[] | null;
	select(start: number, end?: number): void;
	update(): void;
	clear(): HTMLElement;
	['delete'](): void;
}

interface ParamObject {
	type?: string;
	initialize(list: HTMLElement): void;
	parse(item: unknown, data: unknown[], index: number): string | [string, string];
	open(data?: unknown): void;
	save(): unknown;
	update?(): void;
}

const listRef = ref<{ root: HTMLElement | null } | null>(null);

const el = (): ParamListElement | null => listRef.value?.root as ParamListElement | null;

const items = ref<ParamItem[]>([
	{ name: 'attack', value: 10, enabled: true },
	{ name: 'defense', value: 8, enabled: true },
	{ name: 'speed', value: 6, enabled: false },
	{ name: 'luck', value: 3, enabled: true }
]);

let indexCounter = 100;

const object: ParamObject = {
	type: 'demo-param',
	initialize() {},
	parse(item: unknown, _data: unknown[], index: number): string | [string, string] {
		const it = item as ParamItem;
		const first = `${index}. ${it.name}`;
		return [first, it.enabled === false ? `(disabled) ${it.value}` : String(it.value)];
	},
	open() {},
	save() {
		return null;
	}
};

const lastChange = ref('');

const onChange = (value: unknown) => {
	lastChange.value = `change: ${JSON.stringify(value)}`;
};

const write = () => {
	const node = el();
	if (node) {
		node.write([...items.value]);
	}
};

const addRow = () => {
	indexCounter++;
	items.value.push({ name: `param-${indexCounter}`, value: 1, enabled: true });
	write();
};

const removeSelected = () => {
	const node = el();
	if (!node) return;
	node.focus();
	node.select(0);
	node['delete']();
	items.value = (node.read() ?? []) as ParamItem[];
};

const undo = () => {
	const node = el();
	if (!node) return;
	node.update();
};

const reset = () => {
	items.value = [{ name: 'attack', value: 10, enabled: true }];
	write();
};

const historyFactory = (list: HTMLElement): ParamListHistory => new ParamListHistory(list);
const menuRef = ref<InstanceType<typeof YMMenuList> | null>(null);
const menuPopup = (options: MenuOptions, items: MenuItem[]): void => {
	menuRef.value?.popup(options, items);
};
const menuLabels: Record<string, string> = {
	edit: 'Edit',
	insert: 'Insert',
	cut: 'Cut',
	copy: 'Copy',
	paste: 'Paste',
	delete: 'Delete',
	selectAll: 'Select All',
	undo: 'Undo',
	redo: 'Redo',
	toggle: 'Toggle'
};
const localize = (key: string): string => menuLabels[key] ?? key;
const ctrl = (keyName: string): string => `Ctrl+${keyName}`;

onMounted(() => {
	const node = el();
	if (!node) return;
	node.bind(object);
	node.togglable = true;
	write();
});
</script>

<template>
	<section class="demo">
		<h2>YMParamList</h2>
		<p class="desc">
			参数列表：bind(object) 后通过 write(data) 渲染，支持键盘/鼠标选择、Enter 编辑、Insert
			插入、Delete 删除、右键菜单（menuPopup）。
		</p>
		<div class="row">
			<YMButton variant="primary" @click="addRow">Add Row</YMButton>
			<YMButton @click="removeSelected">Delete Selected</YMButton>
			<YMButton @click="undo">Refresh</YMButton>
			<YMButton @click="reset">Reset</YMButton>
			<span class="hint">{{ lastChange }}</span>
		</div>
		<div class="list-box">
			<YMParamList
				ref="listRef"
				id="paramlist-demo"
				flexible
				:history-factory="historyFactory"
				:menu-popup="menuPopup"
				:localize="localize"
				:clipboard="null"
				:ctrl="ctrl"
				@change="onChange"
			/>
		</div>
		<YMMenuList ref="menuRef" />
	</section>
</template>

<style scoped>
.demo {
	margin-bottom: 24px;
}

.row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12px;
	margin: 8px 0;
}

.hint {
	color: var(--ym-color-text);
	opacity: 0.8;
	font-size: 0.9em;
}

.list-box {
	width: 100%;
	max-width: 480px;
	height: 240px;
	border: 1px solid var(--ym-color-border);
	background: var(--ym-color-surface);
	overflow: hidden;
}

.desc {
	color: var(--ym-color-text);
	opacity: 0.7;
	font-size: 0.9em;
	margin: 4px 0;
}
</style>

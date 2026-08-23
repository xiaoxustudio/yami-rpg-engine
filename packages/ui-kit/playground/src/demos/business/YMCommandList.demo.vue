<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { CommandHistory, YMButton, YMCommandList, type CommandListApiOptions } from '@ui-kit';

interface CommandData {
	id: string;
	params: Record<string, unknown>;
	commands?: CommandData[];
	[k: string]: unknown;
}

interface CommandContent {
	text?: string;
	color?: string;
	children?: CommandData[];
}

interface CommandListElement extends HTMLElement {
	write(data: CommandData[]): void;
	read(): CommandData[] | null;
	select(start: number, end?: number): void;
	unselect(): void;
	focus(): void;
	['delete'](): void;
	undo(): void;
	redo(): void;
	clear(): HTMLElement;
}

const listRef = ref<{ root: HTMLElement | null } | null>(null);

const el = (): CommandListElement | null => listRef.value?.root as CommandListElement | null;

const data = ref<CommandData[]>([
	{ id: 'showText', params: { message: 'Hello world' } },
	{
		id: 'showChoices',
		params: { message: 'What will you do?' },
		commands: [
			{ id: 'choice', params: { label: 'Fight' } },
			{ id: 'choice', params: { label: 'Run away' } }
		]
	},
	{
		id: 'ifSwitch',
		params: { key: 'sw-1' },
		commands: [{ id: 'showText', params: { message: 'Switch is ON' } }]
	},
	{ id: 'setNumber', params: { key: 'var-1', value: 10 } },
	{ id: 'comment', params: { text: 'this is a note' } }
]);

let cmdCounter = 0;

const parseCommand = (item: Record<string, unknown>): CommandContent[] => {
	const id = item.id as string;
	const params = item.params as Record<string, unknown>;
	switch (id) {
		case 'showText':
			return [{ color: 'normal' }, { text: `Show message: ${String(params.message)}` }];
		case 'choice':
			return [{ color: 'normal' }, { text: `Choice: ${String(params.label)}` }];
		case 'ifSwitch':
			return [
				{ color: 'normal' },
				{ text: `If switch [${String(params.key)}] is ON` },
				{ children: item.commands as CommandData[] },
				{ text: 'End If' }
			];
		case 'setNumber':
			return [
				{ color: 'normal' },
				{ text: `Set variable [${String(params.key)}] = ${String(params.value)}` }
			];
		case 'comment':
			return [{ color: 'gray' }, { text: `// ${String(params.text)}` }];
		default:
			return [{ color: 'normal' }, { text: String(id) }];
	}
};

const options: CommandListApiOptions = {
	command: {
		parse: parseCommand,
		fetchVariables: () => [],
		insert: () => {},
		edit: () => {},
		parseUnlinkedId: (id: string) => id,
		colorizeCodeLines: () => {}
	},
	commandHistory: CommandHistory,
	clipboard: {
		write: (_type: string, _data: unknown) => {},
		read: () => [],
		has: () => false
	},
	localize: {
		language: 'en-US',
		get: (key: string) => key,
		createGetter: () => (key: string) => key
	},
	menuPopup: () => {},
	getVariable: (key: string) => ({ name: key }),
	ctrl: (key: string) => `Ctrl+${key}`,
	setTooltip: () => {}
};

const write = () => {
	const node = el();
	if (node) {
		node.write([...data.value]);
	}
};

const addCommand = () => {
	cmdCounter++;
	data.value.push({ id: 'setNumber', params: { key: `var-${cmdCounter}`, value: cmdCounter } });
	write();
};

const deleteSelected = () => {
	const node = el();
	if (!node) return;
	node.focus();
	node.select(0);
	node['delete']();
	data.value = node.read() ?? [];
};

const undo = () => el()?.undo();
const redo = () => el()?.redo();

const reset = () => {
	data.value = [{ id: 'showText', params: { message: 'Reset done' } }];
	write();
};

onMounted(() => {
	write();
});
</script>

<template>
	<section class="demo">
		<h2>YMCommandList</h2>
		<p class="desc">命令列表：通过 options 注入 parse / CommandHistory / clipboard 等适配器，write(data) 渲染嵌套命令。</p>
		<div class="row">
			<YMButton variant="primary" @click="addCommand">Add Command</YMButton>
			<YMButton @click="deleteSelected">Delete Selected</YMButton>
			<YMButton @click="undo">Undo</YMButton>
			<YMButton @click="redo">Redo</YMButton>
			<YMButton @click="reset">Reset</YMButton>
		</div>
		<div class="list-box">
			<YMCommandList ref="listRef" id="commandlist-demo" :options="options" />
		</div>
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

.list-box {
	width: 100%;
	max-width: 640px;
	height: 260px;
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

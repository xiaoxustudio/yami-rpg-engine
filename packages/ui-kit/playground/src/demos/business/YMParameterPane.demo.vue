<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
	YMButton,
	YMParameterPane,
	createTypeRegistry,
	createCheckBoxElement,
	createColorBoxElement,
	createCustomBoxElement,
	createDetailBoxElement,
	createDetailSummaryElement,
	createKeyboardBoxElement,
	createNumberBoxElement,
	createNumberVarElement,
	createSelectBoxElement,
	createTextBoxElement
} from '@ui-kit';

interface ParamDef {
	type: string;
	key: string;
	alias?: string;
	value?: unknown;
	min?: number;
	max?: number;
	decimals?: number;
	filter?: string;
	dataItems?: { name: string; value: unknown }[];
	readonly?: boolean;
	validate?: boolean;
	repeatableGroup?: { parameters: ParamDef[] };
}

interface ScriptDef {
	id: string;
	parameters: Record<string, unknown>;
}

interface PaneElement extends HTMLElement {
	getData: () => ScriptDef[];
}

const paneRef = ref<{ root: HTMLElement | null; update(): void; clear(): void } | null>(null);

const controls = {
	checkBox: () => createCheckBoxElement({ standard: true }),
	colorBox: () => createColorBoxElement(),
	keyboardBox: () => createKeyboardBoxElement(),
	customBox: () => createCustomBoxElement(),
	detailBox: () => createDetailBoxElement(),
	detailSummary: () => createDetailSummaryElement(),
	numberBox: () => createNumberBoxElement(),
	numberVar: () => createNumberVarElement(),
	selectBox: () => createSelectBoxElement(),
	textBox: () => createTextBoxElement()
};

const typeRegistry = createTypeRegistry({
	createEasingItems: () => [],
	createTeamItems: () => [],
	getAttributeItems: () => [],
	getStringItems: () => []
});

const script: ScriptDef = {
	id: 'aaaaaaaaaaaaaaaa',
	parameters: {
		name: 'Hero',
		hp: 120,
		enabled: true,
		mode: 1,
		tint: 'ffff0000',
		key: 13,
		image: '',
		speed: 5,
		attacks: [{ label: 'Slash', power: 12 }]
	}
};

const guidMap: Record<string, unknown> = {
	aaaaaaaaaaaaaaaa: {
		parameters: [
			{ type: 'string', key: 'name', alias: 'Name', value: '' },
			{ type: 'number', key: 'hp', alias: 'HP', min: 0, max: 9999, decimals: 0, value: 0 },
			{ type: 'boolean', key: 'enabled', alias: 'Enabled', value: true },
			{
				type: 'option',
				key: 'mode',
				alias: 'Mode',
				value: 0,
				dataItems: [
					{ name: 'Normal', value: 0 },
					{ name: 'Boss', value: 1 },
					{ name: 'Event', value: 2 }
				]
			},
			{ type: 'color', key: 'tint', alias: 'Tint', value: '00000000' },
			{ type: 'keycode', key: 'key', alias: 'Interact Key', value: 13 },
			{ type: 'file', key: 'image', alias: 'Image', filter: 'image', value: '' },
			{
				type: 'repeatable-group',
				key: 'attacks',
				alias: 'Attacks',
				value: [],
				repeatableGroup: {
					parameters: [
						{ type: 'string', key: 'label', alias: 'Label', value: '' },
						{
							type: 'number',
							key: 'power',
							alias: 'Power',
							min: 1,
							max: 999,
							decimals: 0,
							value: 1
						}
					]
				}
			}
		],
		langMap: {
			update: () => ({ get: (key: string | undefined) => key ?? '' })
		},
		manager: { states: {} },
		overview: {}
	}
};

const plugin = {
	reconstruct: () => false,
	checkValidate: (_param: ParamDef, _value: unknown) => true
};

const dataManifest = (): { guidMap: Record<string, unknown> } | null => ({ guidMap });

const measureText = (text: string, font: string): { width: number } => ({
	width: Math.ceil(text.length * 7)
});

const setTooltip = (el: HTMLElement, tip: string): void => {
	el.setAttribute('data-tip', tip);
};

const refresh = () => {
	const node = paneRef.value?.root as PaneElement | null;
	if (!node) return;
	node.getData = () => [script];
	paneRef.value?.update();
};

const lastUpdate = ref('');

const onUpdate = (event: Event) => {
	lastUpdate.value = `update: ${(event.target as HTMLElement).className}`;
};

onMounted(() => {
	refresh();
});
</script>

<template>
	<section class="demo">
		<h2>YMParameterPane</h2>
		<p class="desc">
			参数面板：controls 工厂 + typeRegistry + dataManifest(guidMap)
			渲染脚本参数，支持分组、repeatable-group 行、校验。
		</p>
		<div class="row">
			<YMButton variant="primary" @click="refresh">Refresh Pane</YMButton>
			<span class="hint">{{ lastUpdate }}</span>
		</div>
		<div class="pane-box">
			<YMParameterPane
				ref="paneRef"
				id="parameterpane-demo"
				:controls="controls"
				:type-registry="typeRegistry"
				:data-manifest="dataManifest"
				:plugin="plugin"
				:localize="(key: string) => key"
				:measure-text="measureText"
				:set-tooltip="setTooltip"
				@update="onUpdate"
			/>
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

.hint {
	color: var(--ym-color-text);
	opacity: 0.8;
	font-size: 0.9em;
}

.pane-box {
	width: 100%;
	max-width: 560px;
	height: 440px;
	overflow-y: auto;
	border: 1px solid var(--ym-color-border);
	background: var(--ym-color-surface);
}

.desc {
	color: var(--ym-color-text);
	opacity: 0.7;
	font-size: 0.9em;
	margin: 4px 0;
}
</style>

<template>
	<YMParameterPane
		ref="ym"
		:id="props.id"
		:controls="controls"
		:type-registry="TypeRegistry"
		:data-manifest="dataManifest"
		:plugin="plugin"
		:localize="localize"
		:selection="selection"
		:select-list="selectList"
		:measure-text="measureText"
		:set-tooltip="setTooltip"
	>
		<slot />
	</YMParameterPane>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMParameterPane } from '@ui-kit';
import { createCheckBox as createCheckBoxElement } from '@/components/check-box';
import { createColorBox as createColorBoxElement } from '@/components/color-box';
import { createKeyboardBox as createKeyboardBoxElement } from '@/components/keyboard-box';
import { createCustomBox as createCustomBoxElement } from '@/components/custom-box';
import { createDetailBox as createDetailBoxElement } from '@/components/detail-box';
import { createDetailSummary } from '@/components/detail-summary';
import { createNumberBox as createNumberBoxElement } from '@/components/number-box';
import { createNumberVar as createNumberVarElement } from '@/components/number-var';
import { createSelectBox as createSelectBoxElement } from '@/components/select-box';
import { createTextBox as createTextBoxElement } from '@/components/text-box';
import { TypeRegistry } from '@/components/type-registry';
import { Select } from '@/components/select-list';
import { Data } from '@/data/data-object';
import { PluginManager } from '@/plugin/plugin';
import { Local } from '@/tools/localization';
import { Selection } from '@/tools/text-capture';
import { measureText as measureTextUtil } from '@/util/dom';
import { setTooltip as setTooltipUtil } from '@/util/element-utils';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const controls = {
	checkBox: () => createCheckBoxElement(true),
	colorBox: () => createColorBoxElement(),
	keyboardBox: () => createKeyboardBoxElement(),
	customBox: () => createCustomBoxElement(),
	detailBox: () => createDetailBoxElement(),
	detailSummary: () => createDetailSummary(),
	numberBox: () => createNumberBoxElement(),
	numberVar: () => createNumberVarElement(),
	selectBox: () => createSelectBoxElement(),
	textBox: () => createTextBoxElement()
};

const dataManifest = (): any => (Data as any).manifest;
const plugin = computed(() => PluginManager);
const localize = (key: string): string => Local.get(key);
const selection = computed(() => Selection);
const selectList = computed(() => Select);
const measureText = (text: string, font: string): { width: number } =>
	measureTextUtil(text, font);
const setTooltip = (el: HTMLElement, tip: string): void => setTooltipUtil(el, tip);

const ym = ref<{
	root: HTMLElement | null;
	bind(scriptList: HTMLElement): void;
	rewrite(parameters: any, key: string): void;
	update(): void;
	clear(): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const bind = (scriptList: HTMLElement): void => ym.value?.bind(scriptList);
const rewrite = (parameters: any, key: string): void => ym.value?.rewrite(parameters, key);
const update = (): void => ym.value?.update();
const clear = (): void => ym.value?.clear();
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ bind, rewrite, update, clear, on, root });

onMounted(() => {
	const el = root.value as any;
	if (!el) return;
	el.bind = bind;
	el.rewrite = rewrite;
	el.update = update;
	el.clear = clear;
	el.on = on;
});
</script>

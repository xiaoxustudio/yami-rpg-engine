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
import { createCheckBox as createCheckBoxElement } from '@app/components/check-box';
import { createColorBox as createColorBoxElement } from '@app/components/color-box';
import { createKeyboardBox as createKeyboardBoxElement } from '@app/components/keyboard-box';
import {
	customBoxFactory,
	numberBoxFactory,
	selectBoxFactory,
	textBoxFactory
} from '@app/components/var-factories';
import { createDetailBox as createDetailBoxElement } from '@app/components/detail-box';
import { createDetailSummary } from '@app/components/detail-summary';
import { createNumberVar as createNumberVarElement } from '@app/components/number-var';
import { TypeRegistry } from '@app/components/type-registry';
import { Select } from '@app/components/select-list';
import { Data } from '@app/data/data-object';
import { PluginManager } from '@app/plugin/plugin';
import { t } from '@app/i18n';
import { Selection } from '@app/tools/text-capture';
import { measureText as measureTextUtil } from '@app/utils/dom';
import { setTooltip as setTooltipUtil } from '@app/utils/element-utils';
import { attachElementApi } from '@app/utils/attach-element-api';

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

const controls = {
	checkBox: () => createCheckBoxElement(true),
	colorBox: () => createColorBoxElement(),
	keyboardBox: () => createKeyboardBoxElement(),
	customBox: () => customBoxFactory(),
	detailBox: () => createDetailBoxElement(),
	detailSummary: () => createDetailSummary(),
	numberBox: () => numberBoxFactory(),
	numberVar: () => createNumberVarElement(),
	selectBox: () => selectBoxFactory(),
	textBox: () => textBoxFactory()
};

const dataManifest = (): { guidMap: Record<string, unknown> } | null => Data.manifest;
const plugin = computed(() => PluginManager);
const localize = (key: string): string => t(key);
const selection = computed(() => Selection);
const selectList = computed(() => Select);
const measureText = (text: string, font: string): { width: number } => measureTextUtil(text, font);
const setTooltip = (el: HTMLElement, tip: string): void => setTooltipUtil(el, tip);

const ym = ref<{
	root: HTMLElement | null;
	bind(scriptList: HTMLElement): void;
	rewrite(parameters: Record<string, unknown>, key: string): void;
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
const rewrite = (parameters: Record<string, unknown>, key: string): void =>
	ym.value?.rewrite(parameters, key);
const update = (): void => ym.value?.update();
const clear = (): void => ym.value?.clear();
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ bind, rewrite, update, clear, on, root });

onMounted(() => {
	const el = root.value as HTMLElement &
		Record<'bind' | 'rewrite' | 'update' | 'clear' | 'on', unknown>;
	if (!el) return;
	attachElementApi(el, { bind, rewrite, update, clear, on });
});
</script>

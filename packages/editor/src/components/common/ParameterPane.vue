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
import { computed, ref, toValue } from 'vue';
import { useI18n } from 'vue-i18n';
import { YMParameterPane } from '@ui-kit';
import type { ManifestEntry } from '@ui-kit';
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
import { Selection } from '@app/tools/text-capture';
import { measureText as measureTextUtil } from '@app/utils/dom';
import { setTooltip as setTooltipUtil } from '@app/utils/element-utils';
import { controlApiOfElement } from '@app/utils/control-instance';

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

const { t } = useI18n();

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

const dataManifest = (): { guidMap: Record<string, ManifestEntry> } | null => Data.manifest;
const plugin = computed(
	() =>
		PluginManager as {
			reconstruct(script: Record<string, unknown>): boolean;
			checkValidate(param: unknown, val: unknown): boolean;
		}
);
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
	configure(options: Record<string, unknown>): void;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const bind = (scriptList: unknown): void => {
	// 页面交出的是列表根元素：先换成包装层，再取它暴露的 YMParamList 实例；
	// 拆分后 object/data 只在实例上，元素只剩 DOM。
	const wrapper = controlApiOfElement(scriptList) as { self?: unknown } | null;
	const handle = toValue(wrapper?.self) ?? wrapper ?? scriptList;
	ym.value?.bind(handle as never);
};
const rewrite = (parameters: Record<string, unknown>, key: string): void =>
	ym.value?.rewrite(parameters, key);
const update = (): void => ym.value?.update();
const clear = (): void => ym.value?.clear();
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

const configure = (options: Record<string, unknown>): void => ym.value?.configure(options);

defineExpose({ bind, rewrite, update, clear, on, configure, root });
</script>

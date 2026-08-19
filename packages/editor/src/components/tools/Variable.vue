<template>
	<!-- 鍙橀噺绐楀彛 -->
	<WindowFrame id="variable" show-apply mode="center" @apply="onApply">
		<template #title><TitleBar>{{ t('components.variable.title') }}<div class="close" /></TitleBar></template>
		
			<div class="field-set input pad" id="variable-list-fieldset">
				<div class="legend">{{ t('components.variable-list.label') }}</div>
				<TreeList
					id="variable-list"
					padded
					:node-extras="nodeExtras"
					:node-icon-renderer="nodeIconRenderer"
					@select="onListSelect"
					@record="onListRecord"
					@popup="onListPopup"
					@open="onListOpen"
				/>
			</div>
			<div class="field-set" id="variable-properties-fieldset">
				<div class="legend">{{ t('components.variable-properties-flex.label') }}</div>
				<div class="flex-box" id="variable-properties-flex">
					<div class="flex-item"><div class="text">{{ t('components.variable-name.label') }}</div><TextBox id="variable-name" @input="onNameInput" /></div>
					<div class="flex-item"
						><div class="text">{{ t('components.variable-sort-normal.label') }}</div>
						<RadioBox
							id="variable-sort-normal"
							name="variable-sort"
							class="standard"
							value="0"
							@input="onSortInput"
							@write="onSortWrite"
							><div class="text" id="variable-sort-normal-label">{{ t('components.variable-sort-normal-label.content') }}</div></RadioBox
						>
						<RadioBox
							id="variable-sort-shared"
							name="variable-sort"
							class="standard"
							value="1"
							@input="onSortInput"
							@write="onSortWrite"
							><div class="text" id="variable-sort-shared-label">{{ t('components.variable-sort-shared-label.content') }}</div></RadioBox
						>
						<RadioBox
							id="variable-sort-temporary"
							name="variable-sort"
							class="standard"
							value="2"
							@input="onSortInput"
							@write="onSortWrite"
							><div class="text" id="variable-sort-temporary-label">{{ t('components.variable-sort-temporary-label.content') }}</div></RadioBox
						>
					</div>
					<div class="flex-item"
						><div class="text">{{ t('components.variable-type-boolean.label') }}</div>
						<RadioBox
							id="variable-type-boolean"
							name="variable-type"
							class="standard"
							value="boolean"
							@input="onTypeInput"
							@write="onTypeWrite"
							><div class="text" id="variable-type-boolean-label">{{ t('components.variable-type-boolean-label.content') }}</div></RadioBox
						>
						<RadioBox
							id="variable-type-number"
							name="variable-type"
							class="standard"
							value="number"
							@input="onTypeInput"
							@write="onTypeWrite"
							><div class="text" id="variable-type-number-label">{{ t('components.variable-type-number-label.content') }}</div></RadioBox
						>
						<RadioBox
							id="variable-type-string"
							name="variable-type"
							class="standard"
							value="string"
							@input="onTypeInput"
							@write="onTypeWrite"
							><div class="text" id="variable-type-string-label">{{ t('components.variable-type-string-label.content') }}</div></RadioBox
						>
						<RadioBox
							id="variable-type-object"
							name="variable-type"
							class="standard"
							value="object"
							@input="onTypeInput"
							@write="onTypeWrite"
							><div class="text" id="variable-type-object-label">{{ t('components.variable-type-object-label.content') }}</div></RadioBox
						>
					</div>
					<div class="flex-item" id="variable-value-box"
						><div class="text">{{ t('components.variable-value-manager.label') }}</div>
						<PageManager id="variable-value-manager">
							<div class="page-frame" value="boolean">
								<RadioBox
									id="variable-value-boolean-false"
									name="variable-value-boolean"
									class="standard"
									value="false"
									>False</RadioBox
								>
								<RadioBox
									id="variable-value-boolean-true"
									name="variable-value-boolean"
									class="standard"
									value="true"
									>True</RadioBox
								>
							</div>
							<div class="page-frame" value="number">
								<NumberBox
									id="variable-value-number"
									min="-1000000000"
									max="1000000000"
									decimals="10"
								/>
							</div>
							<div class="page-frame" value="string">
								<TextArea id="variable-value-string" />
							</div>
						</PageManager>
					</div>
					<div class="flex-item"><div class="text">{{ t('components.variable-note.label') }}</div><TextArea id="variable-note" /></div>
				</div>
			</div>
			<TextBox id="variable-searcher" name="search" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import { useI18n } from 'vue-i18n';
import { Variable } from '@app/legacy/variable/variable.ts';
import { Command } from '@app/legacy/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import PageManager from '@app/components/common/PageManager.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

const nodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as { class?: string; value?: unknown; sort?: number; note?: string };
	const nodes: VNode[] = [];
	const element = container.parentNode as HTMLElement | null;
	element?.classList.add('variable-item');
	if (node.class === 'folder') {
		return nodes;
	}
	element?.classList.add('reference');
	element?.classList.remove('shared-variable', 'temporary-variable');
	switch (node.sort) {
		case 1:
			element?.classList.add('shared-variable');
			break;
		case 2:
			element?.classList.add('temporary-variable');
			break;
	}
	let initText = '';
	switch (typeof node.value) {
		case 'boolean':
		case 'number':
			initText = ` = ${node.value}`;
			break;
		case 'string':
			initText = ` = "${Command.parseMultiLineString!(node.value)}"`;
			break;
		case 'object':
			initText = '';
			break;
	}
	nodes.push(h('div', { class: 'variable-init-text text' }, initText));
	if (node.note) {
		nodes.push(h('node-icon', { class: 'icon-note' }, '\uf27b'));
	}
	return nodes;
};

const nodeIconRenderer = (item: unknown): VNode[] => {
	const node = item as { class?: string; value?: unknown };
	const classes = {
		boolean: 'icon-boolean',
		number: 'icon-number',
		string: 'icon-string',
		object: 'icon-object'
	};
	if (node.class === 'folder') {
		return [h('node-icon', { class: 'icon-folder' })];
	}
	return [h('node-icon', { class: (classes as Record<string, string>)[typeof node.value] })];
};

const onListSelect = (event: Event) => {
	Variable?.listSelect?.(event);
};
const onListRecord = (event: Event) => {
	Variable?.listRecord?.(event);
};
const onListPopup = (event: Event) => {
	Variable?.listPopup?.(event);
};
const onListOpen = (event: Event) => {
	Variable?.listOpen?.(event);
};
const onNameInput = (value: string) => {
	Variable?.nameInput?.({ target: { value } });
};
let lastSortValue: number | string | boolean | undefined;
let lastSortWriteValue: number | string | boolean | undefined;
let lastTypeValue: number | string | boolean | undefined;
let lastTypeWriteValue: number | string | boolean | undefined;
const onSortInput = (value: number | string | boolean) => {
	if (lastSortValue !== value) {
		lastSortValue = value;
		Variable?.sortInput?.({ value });
	}
};
const onSortWrite = (value: number | string | boolean) => {
	if (lastSortWriteValue !== value) {
		lastSortWriteValue = value;
		Variable?.sortWrite?.({ value });
	}
};
const onTypeInput = (value: number | string | boolean) => {
	if (lastTypeValue !== value) {
		lastTypeValue = value;
		Variable?.typeInput?.({ value });
	}
};
const onTypeWrite = (value: number | string | boolean) => {
	if (lastTypeWriteValue !== value) {
		lastTypeWriteValue = value;
		Variable?.typeWrite?.({ value });
	}
};

const onApply = () => {
	Variable?.apply?.();
};

onMounted(() => {


});
</script>

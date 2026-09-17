<template>
	<!-- 鍙橀噺绐楀彛 -->
	<WindowFrame id="variable"
				:ref="registryRef(variableEls, 'variable')" show-apply mode="center" @apply="onApply" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.variable.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="field-set input pad" id="variable-list-fieldset">
			<div class="legend">{{ t('components.variable-list.label') }}</div>
			<TreeList
				id="variable-list"
				:ref="registryRef(variableEls, 'variable-list')"
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
			<div class="flex-box" id="variable-properties-flex"
				:ref="registryRef(variableEls, 'variable-properties-flex')">
				<div class="flex-item">
					<div class="text">{{ t('components.variable-name.label') }}</div>
					<TextBox id="variable-name"
				v-tip="t('components.variable-name.tip')"
				:ref="registryRef(variableEls, 'variable-name')" @input="onNameInput" />
				</div>
				<div class="flex-item">
					<div class="text">{{ t('components.variable-sort-normal.label') }}</div>
					<RadioBox
						id="variable-sort-normal"
						name="variable-sort"
						class="standard"
						value="0"
						@input="onSortInput"
						@write="onSortWrite"
						><div class="text" id="variable-sort-normal-label"
				v-tip="t('components.variable-sort-normal-label.tip')">
							{{ t('components.variable-sort-normal-label.content') }}
						</div></RadioBox
					>
					<RadioBox
						id="variable-sort-shared"
						name="variable-sort"
						class="standard"
						value="1"
						@input="onSortInput"
						@write="onSortWrite"
						><div class="text" id="variable-sort-shared-label"
				v-tip="t('components.variable-sort-shared-label.tip')">
							{{ t('components.variable-sort-shared-label.content') }}
						</div></RadioBox
					>
					<RadioBox
						id="variable-sort-temporary"
						name="variable-sort"
						class="standard"
						value="2"
						@input="onSortInput"
						@write="onSortWrite"
						><div class="text" id="variable-sort-temporary-label"
				v-tip="t('components.variable-sort-temporary-label.tip')">
							{{ t('components.variable-sort-temporary-label.content') }}
						</div></RadioBox
					>
				</div>
				<div class="flex-item">
					<div class="text">{{ t('components.variable-type-boolean.label') }}</div>
					<RadioBox
						id="variable-type-boolean"
						name="variable-type"
						class="standard"
						value="boolean"
						@input="onTypeInput"
						@write="onTypeWrite"
						><div class="text" id="variable-type-boolean-label"
				v-tip="t('components.variable-type-boolean-label.tip')">
							{{ t('components.variable-type-boolean-label.content') }}
						</div></RadioBox
					>
					<RadioBox
						id="variable-type-number"
						name="variable-type"
						class="standard"
						value="number"
						@input="onTypeInput"
						@write="onTypeWrite"
						><div class="text" id="variable-type-number-label"
				v-tip="t('components.variable-type-number-label.tip')">
							{{ t('components.variable-type-number-label.content') }}
						</div></RadioBox
					>
					<RadioBox
						id="variable-type-string"
						name="variable-type"
						class="standard"
						value="string"
						@input="onTypeInput"
						@write="onTypeWrite"
						><div class="text" id="variable-type-string-label"
				v-tip="t('components.variable-type-string-label.tip')">
							{{ t('components.variable-type-string-label.content') }}
						</div></RadioBox
					>
					<RadioBox
						id="variable-type-object"
				:ref="registryRef(variableEls, 'variable-type-object')"
						name="variable-type"
						class="standard"
						value="object"
						@input="onTypeInput"
						@write="onTypeWrite"
						><div class="text" id="variable-type-object-label"
				v-tip="t('components.variable-type-object-label.tip')">
							{{ t('components.variable-type-object-label.content') }}
						</div></RadioBox
					>
				</div>
				<div class="flex-item" id="variable-value-box"
				:ref="registryRef(variableEls, 'variable-value-box')">
					<div class="text">{{ t('components.variable-value-manager.label') }}</div>
					<PageManager id="variable-value-manager"
				:ref="registryRef(variableEls, 'variable-value-manager')">
						<div class="page-frame" value="boolean">
							<RadioBox
								id="variable-value-boolean-false"
				v-tip="t('components.variable-value-boolean-false.tip')"
								name="variable-value-boolean"
								class="standard"
								value="false"
								>False</RadioBox
							>
							<RadioBox
								id="variable-value-boolean-true"
				v-tip="t('components.variable-value-boolean-true.tip')"
								name="variable-value-boolean"
								class="standard"
								value="true"
								>True</RadioBox
							>
						</div>
						<div class="page-frame" value="number">
							<NumberBox
								id="variable-value-number"
				v-tip="t('components.variable-value-number.tip')"
				:ref="registryRef(variableEls, 'variable-value-number')"
								min="-1000000000"
								max="1000000000"
								decimals="10"
							/>
						</div>
						<div class="page-frame" value="string">
							<TextArea id="variable-value-string"
				v-tip="t('components.variable-value-string.tip')"
				:ref="registryRef(variableEls, 'variable-value-string')" />
						</div>
					</PageManager>
				</div>
				<div class="flex-item">
					<div class="text">{{ t('components.variable-note.label') }}</div>
					<TextArea id="variable-note"
				v-tip="t('components.variable-note.tip')"
				:ref="registryRef(variableEls, 'variable-note')" />
				</div>
			</div>
		</div>
		<TextBox id="variable-searcher"
				:ref="registryRef(variableEls, 'variable-searcher')" name="search" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import type { YamiEvent, YamiMouseEvent } from '@app/types/editor-event';
import { variableEls } from '@app/variable/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { Variable } from '@app/variable/variable.ts';
import { parseMultiLineString } from '@app/composables/useCommandParse.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { getVariableStore } from '@app/stores/variable';
import PageManager from '@app/components/common/PageManager.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

// P5b 批次 4：variable-confirm 由 WindowFrame 生成，改由 @confirm 驱动
const onConfirm = () => {
	Variable?.confirm?.(new Event('click'));
};

const { t } = useI18n();

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
			initText = ` = "${parseMultiLineString(node.value)}"`;
			break;
		case 'object':
			initText = '';
			break;
	}
	nodes.push(h('div', { class: 'variable-init-text text' }, initText));
	if (node.note) {
		nodes.push(h('span', { class: ['node-icon', 'icon-note'] }, '\uf27b'));
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
		return [h('span', { class: ['node-icon', 'icon-folder'] })];
	}
	return [
		h('span', { class: ['node-icon', (classes as Record<string, string>)[typeof node.value]] })
	];
};

const onListSelect = (event: YamiEvent) => {
	Variable?.listSelect?.(event as YamiMouseEvent);
};
const onListRecord = (event: YamiEvent) => {
	Variable?.listRecord?.(event as YamiMouseEvent);
};
const onListPopup = (event: YamiEvent) => {
	Variable?.listPopup?.(event as YamiMouseEvent);
};
const onListOpen = (event: YamiEvent) => {
	Variable?.listOpen?.(event as YamiMouseEvent);
};
const onNameInput = (value: string) => {
	Variable?.nameInput?.({ target: { value } } as Event & { target: HTMLInputElement });
};
let lastSortValue: number | string | boolean | undefined;
let lastSortWriteValue: number | string | boolean | undefined;
let lastTypeValue: number | string | boolean | undefined;
let lastTypeWriteValue: number | string | boolean | undefined;
const onSortInput = (value: number | string | boolean) => {
	if (lastSortValue !== value) {
		lastSortValue = value;
		Variable?.sortInput?.({ value } as Event & { value: number | string | boolean });
	}
};
const onSortWrite = (value: number | string | boolean) => {
	if (lastSortWriteValue !== value) {
		lastSortWriteValue = value;
		Variable?.sortWrite?.({ value } as Event & { value: number | string | boolean });
	}
};
const onTypeInput = (value: number | string | boolean) => {
	if (lastTypeValue !== value) {
		lastTypeValue = value;
		Variable?.typeInput?.({ value } as Event & { value: number | string | boolean });
	}
};
const onTypeWrite = (value: number | string | boolean) => {
	if (lastTypeWriteValue !== value) {
		lastTypeWriteValue = value;
		Variable?.typeWrite?.({ value } as Event & { value: number | string | boolean });
	}
};

const onApply = () => {
	Variable?.apply?.(new Event('click'));
};

onMounted(() => {
	getVariableStore().initialize();
});
</script>

<style>
/* 窗口样式迁移：由 Project/css/data.css 迁入组件（选择器为全局 id，不能用 scoped） */
#variable {
	width: 572px;
	height: 700px;
}

#variable-list-fieldset {
	left: 10px;
	top: 10px;
	width: 320px;
	height: 622px;
}

#variable-list {
	font-family: var(--font-family-mono);
}

#variable-properties-fieldset {
	left: 340px;
	top: 10px;
	width: 222px;
	height: 622px;
}

#variable-properties-flex {
	flex-direction: column;
}

#variable-value-box {
	height: 148px;
}

#variable-value-string {
	height: 128px;
}

#variable-note {
	height: 196px;
}

#variable-searcher {
	position: absolute;
	left: 10px;
	bottom: 10px;
	width: 258px;
}

#variable-confirm {
	right: 206px;
	bottom: 10px;
}

#variable-cancel {
	right: 108px;
	bottom: 10px;
}

#variable-apply {
	right: 10px;
	bottom: 10px;
}
</style>


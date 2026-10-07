<template>
	<WindowFrame
		id="variable"
		:ref="registryRef(variableEls, 'variable')"
		show-apply
		mode="center"
		@apply="onApply"
		@confirm="onConfirm"
	>
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
		<VariablePropertiesSection />
		<TextBox
			id="variable-searcher"
			:ref="registryRef(variableEls, 'variable-searcher')"
			name="search"
		/>
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
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';
import VariablePropertiesSection from './variable/VariablePropertiesSection.vue';

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

const onApply = () => {
	Variable?.apply?.(new Event('click'));
};

onMounted(() => {
	getVariableStore().initialize();
});
</script>
<style>
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

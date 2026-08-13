<template>
	<WindowFrame id="attribute" show-apply @apply="onApply">
		<template #title><TitleBar>Attribute<div class="close" /></TitleBar></template>
		
			<div class="field-set input pad" id="attribute-list-fieldset">
				<div class="legend">List</div>
				<TreeList
					id="attribute-list"
					padded
					:node-extras="nodeExtras"
					:node-icon-renderer="nodeIconRenderer"
					@select="onListSelect"
					@record="onListRecord"
					@open="onListOpen"
					@popup="onListPopup"
				/>
			</div>
			<div class="field-set" id="attribute-properties-fieldset">
				<div class="legend">Properties</div>
				<div class="flex-box" id="attribute-properties-flex">
					<div class="flex-item"
						><div class="text">Name</div
						><TextBox id="attribute-name" menu="tag-localization" @input="onNameInput" /></div>
					<div class="flex-item"><div class="text">Key</div><TextBox id="attribute-key" @input="onKeyInput" /></div>
					<div class="flex-item" id="attribute-type-box"
						><div class="text">Type</div>
						<RadioBox
							id="attribute-type-boolean"
							name="attribute-type"
							class="standard"
							value="boolean"
							@input="onTypeInput"
							@write="onTypeWrite"
							><div class="text" id="attribute-type-boolean-label">Boolean</div></RadioBox
						>
						<RadioBox
							id="attribute-type-number"
							name="attribute-type"
							class="standard"
							value="number"
							@input="onTypeInput"
							@write="onTypeWrite"
							><div class="text" id="attribute-type-number-label">Number</div></RadioBox
						>
						<RadioBox
							id="attribute-type-string"
							name="attribute-type"
							class="standard"
							value="string"
							@input="onTypeInput"
							@write="onTypeWrite"
							><div class="text" id="attribute-type-string-label">String</div></RadioBox
						>
						<RadioBox
							id="attribute-type-enum"
							name="attribute-type"
							class="standard"
							value="enum"
							@input="onTypeInput"
							@write="onTypeWrite"
							><div class="text" id="attribute-type-enum-label">String(Enum)</div></RadioBox
						>
						<RadioBox
							id="attribute-type-object"
							name="attribute-type"
							class="standard"
							value="object"
							@input="onTypeInput"
							@write="onTypeWrite"
							><div class="text" id="attribute-type-object-label"
								>Object(For Element)</div
							></RadioBox
						>
					</div>
					<div class="flex-item" id="attribute-enum-box"
						><div class="text">Options</div>
						<CustomBox id="attribute-enum" type="enum-group" /></div>
					<div class="flex-item"><div class="text">Note</div><TextArea id="attribute-note" /></div>
				</div>
			</div>
			<TextBox id="attribute-searcher" name="search" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import { Attribute } from '@/attribute/attribute-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { getAttributeStore } from '@app/stores/attribute';
import CustomBox from '@app/components/common/CustomBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const nodeExtras = (item: unknown): VNode[] => {
	const node = item as { class?: string; id: string; key?: string; note?: string };
	const nodes: VNode[] = [];
	if (node.class === 'folder') {
		const store = getAttributeStore();
		let group = '';
		for (const key of store.state.settingKeys ?? []) {
			if (node.id === store.state.settings?.[key]) {
				group = key;
			}
		}
		if (group) {
			nodes.push(h('div', { class: 'enum-init-text text' }, ' ★'));
		}
	} else {
		if (node.key) {
			nodes.push(h('div', { class: 'attribute-init-text text' }, ` = ${node.key}`));
		}
		if (node.note) {
			nodes.push(h('node-icon', { class: 'icon-note' }, '\uf27b'));
		}
	}
	return nodes;
};

const nodeIconRenderer = (item: unknown): VNode[] => {
	const node = item as { class?: string; type?: string };
	const classes = {
		boolean: 'icon-boolean',
		number: 'icon-number',
		string: 'icon-string',
		enum: 'icon-string',
		object: 'icon-object'
	};
	if (node.class === 'folder') {
		return [h('node-icon', { class: 'icon-folder' })];
	}
	return [h('node-icon', { class: (classes as Record<string, string>)[node.type ?? ''] })];
};

const onListSelect = (event: Event) => {
	Attribute?.listSelect?.(event);
};
const onListRecord = (event: Event) => {
	Attribute?.listRecord?.(event);
};
const onListOpen = (event: Event) => {
	Attribute?.listOpen?.(event as MouseEvent);
};
const onListPopup = (event: Event & { clientX: number; clientY: number }) => {
	Attribute?.listPopup?.(event);
};
const onNameInput = (value: string) => {
	Attribute?.nameInput?.({ target: { value } });
};
const onKeyInput = (value: string) => {
	Attribute?.keyInput?.({ target: { value } });
};
let lastTypeValue: number | string | boolean | undefined;
let lastTypeWriteValue: number | string | boolean | undefined;
const onTypeInput = (value: number | string | boolean) => {
	if (lastTypeValue !== value) {
		lastTypeValue = value;
		Attribute?.typeInput?.({ value });
	}
};
const onTypeWrite = (value: number | string | boolean) => {
	if (lastTypeWriteValue !== value) {
		lastTypeWriteValue = value;
		Attribute?.typeWrite?.({ value });
	}
};

const onApply = () => {
	Attribute?.apply?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>

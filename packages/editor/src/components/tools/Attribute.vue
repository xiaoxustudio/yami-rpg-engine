<template>
	<WindowFrame id="attribute" ref="frame" show-apply @apply="onApply" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.attribute.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="field-set input pad" id="attribute-list-fieldset">
			<div class="legend">{{ t('components.attribute-list.label') }}</div>
			<TreeList
				id="attribute-list"
				ref="listRef"
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
			<div class="legend">{{ t('components.attribute-properties-flex.label') }}</div>
			<div class="flex-box" id="attribute-properties-flex" ref="panelRef">
				<div class="flex-item">
					<div class="text">{{ t('components.attribute-name.label') }}</div>
					<TextBox
						:label="t('components.attribute-name.label')"
						id="attribute-name"
						v-tip="t('components.attribute-name.tip')"
						ref="nameRef"
						menu="tag-localization"
						@input="onNameInput"
					/>
				</div>
				<div class="flex-item">
					<div class="text">{{ t('components.attribute-key.label') }}</div>
					<TextBox
						:label="t('components.attribute-key.label')"
						id="attribute-key"
						:placeholder="t('components.attribute-key.placeholder')"
						v-tip="t('components.attribute-key.tip')"
						ref="keyRef"
						@input="onKeyInput"
					/>
				</div>
				<div class="flex-item" id="attribute-type-box">
					<div class="text">{{ t('components.attribute-type-boolean.label') }}</div>
					<RadioBox
						id="attribute-type-boolean"
						name="attribute-type"
						class="standard"
						value="boolean"
						@input="onTypeInput"
						@write="onTypeWrite"
						><div
							class="text"
							id="attribute-type-boolean-label"
							v-tip="t('components.attribute-type-boolean-label.tip')"
						>
							{{ t('components.attribute-type-boolean-label.content') }}
						</div></RadioBox
					>
					<RadioBox
						id="attribute-type-number"
						name="attribute-type"
						class="standard"
						value="number"
						@input="onTypeInput"
						@write="onTypeWrite"
						><div
							class="text"
							id="attribute-type-number-label"
							v-tip="t('components.attribute-type-number-label.tip')"
						>
							{{ t('components.attribute-type-number-label.content') }}
						</div></RadioBox
					>
					<RadioBox
						id="attribute-type-string"
						name="attribute-type"
						class="standard"
						value="string"
						@input="onTypeInput"
						@write="onTypeWrite"
						><div
							class="text"
							id="attribute-type-string-label"
							v-tip="t('components.attribute-type-string-label.tip')"
						>
							{{ t('components.attribute-type-string-label.content') }}
						</div></RadioBox
					>
					<RadioBox
						id="attribute-type-enum"
						name="attribute-type"
						class="standard"
						value="enum"
						@input="onTypeInput"
						@write="onTypeWrite"
						><div
							class="text"
							id="attribute-type-enum-label"
							v-tip="t('components.attribute-type-enum-label.tip')"
						>
							{{ t('components.attribute-type-enum-label.content') }}
						</div></RadioBox
					>
					<RadioBox
						id="attribute-type-object"
						name="attribute-type"
						class="standard"
						value="object"
						@input="onTypeInput"
						@write="onTypeWrite"
						><div
							class="text"
							id="attribute-type-object-label"
							v-tip="t('components.attribute-type-object-label.tip')"
						>
							{{ t('components.attribute-type-object-label.content') }}
						</div></RadioBox
					>
				</div>
				<div class="flex-item" id="attribute-enum-box" ref="enumBoxRef">
					<div class="text">{{ t('components.attribute-enum.label') }}</div>
					<CustomBox
						id="attribute-enum"
						v-tip="t('components.attribute-enum.tip')"
						ref="enumRef"
						type="enum-group"
					/>
				</div>
				<div class="flex-item">
					<div class="text">{{ t('components.attribute-note.label') }}</div>
					<TextArea
						:label="t('components.attribute-note.label')"
						id="attribute-note"
						v-tip="t('components.attribute-note.tip')"
						ref="noteRef"
					/>
				</div>
			</div>
		</div>
		<TextBox id="attribute-searcher" ref="searcherRef" name="search" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { YamiElement } from '@app/types/element-api';
import { Attribute } from '@app/attribute/attribute-window.ts';
import {
	provideAttributeHandles,
	resetAttributeHandles,
	type AttributeWindowHandles
} from '@app/composables/attribute-handles';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { getAttributeStore } from '@app/stores/attribute';
import CustomBox from '@app/components/common/CustomBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const { t } = useI18n();

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
			nodes.push(h('span', { class: ['node-icon', 'icon-note'] }, '\uf27b'));
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
		return [h('span', { class: ['node-icon', 'icon-folder'] })];
	}
	return [
		h('span', { class: ['node-icon', (classes as Record<string, string>)[node.type ?? '']] })
	];
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
const onListPopup = (event: Event & { value?: unknown; clientX?: number; clientY?: number }) => {
	Attribute?.listPopup?.(event as Event & { clientX: number; clientY: number });
};
const onNameInput = (value: string) => {
	Attribute?.nameInput?.({ target: { value } } as InputEvent & { target: HTMLInputElement });
};
const onKeyInput = (value: string) => {
	Attribute?.keyInput?.({ target: { value } } as InputEvent & { target: HTMLInputElement });
};
let lastTypeValue: number | string | boolean | undefined;
let lastTypeWriteValue: number | string | boolean | undefined;
const onTypeInput = (value: number | string | boolean) => {
	if (lastTypeValue !== value) {
		lastTypeValue = value;
		Attribute?.typeInput?.({ value } as Event & { value: number | string | boolean });
	}
};
const onTypeWrite = (value: number | string | boolean) => {
	if (lastTypeWriteValue !== value) {
		lastTypeWriteValue = value;
		Attribute?.typeWrite?.({ value } as Event & { value: number | string | boolean });
	}
};

const onApply = () => {
	Attribute?.apply?.();
};

const onConfirm = () => {
	Attribute?.confirm?.(new Event('click'));
};

onMounted(() => {});

/**
 * 长期持有的 9 个节点一次交给单例（它把 list/panel/searcher/inputs 存成字段并跨 open/close 复用）。
 * 组件 ref 统一取根元素：单例把它们当「带元素 API 的元素」用。
 */
const frame = ref<InstanceType<typeof WindowFrame> | null>(null);
const listRef = ref<unknown>(null);
const panelRef = ref<unknown>(null);
const nameRef = ref<unknown>(null);
const keyRef = ref<unknown>(null);
const noteRef = ref<unknown>(null);
const enumRef = ref<unknown>(null);
const enumBoxRef = ref<unknown>(null);
const searcherRef = ref<unknown>(null);

const rootOf = (target: unknown): YamiElement | null => {
	const instance = target as { root?: unknown; $el?: unknown } | null;
	const el = instance?.root ?? instance?.$el ?? target;
	return el instanceof HTMLElement ? (el as YamiElement) : null;
};

let handles: AttributeWindowHandles | null = null;

onMounted(() => {
	const root = rootOf(frame.value);
	const list = rootOf(listRef.value);
	const panel = rootOf(panelRef.value);
	const searcher = rootOf(searcherRef.value);
	const name = rootOf(nameRef.value);
	const key = rootOf(keyRef.value);
	const note = rootOf(noteRef.value);
	const enumControl = rootOf(enumRef.value);
	const enumBox = rootOf(enumBoxRef.value);
	if (
		!root ||
		!list ||
		!panel ||
		!searcher ||
		!name ||
		!key ||
		!note ||
		!enumControl ||
		!enumBox
	) {
		return;
	}
	handles = { root, list, panel, searcher, name, key, note, enum: enumControl, enumBox };
	provideAttributeHandles(handles);
	onUnmounted(() => {
		if (handles) resetAttributeHandles(handles);
	});
});
</script>

<style>
#attribute {
	width: 572px;
	height: 700px;
}

#attribute-list-fieldset {
	left: 10px;
	top: 10px;
	width: 320px;
	height: 622px;
}

#attribute-list {
	font-family: var(--font-family-mono);
}

#attribute-properties-fieldset {
	left: 340px;
	top: 10px;
	width: 222px;
	height: 622px;
}

#attribute-properties-flex {
	flex-direction: column;
}

#attribute-enum-box {
	height: 168px;
}

#attribute-note {
	height: 196px;
}

#attribute-searcher {
	position: absolute;
	left: 10px;
	bottom: 10px;
	width: 258px;
}

#attribute-confirm {
	right: 206px;
	bottom: 10px;
}

#attribute-cancel {
	right: 108px;
	bottom: 10px;
}

#attribute-apply {
	right: 10px;
	bottom: 10px;
}
</style>

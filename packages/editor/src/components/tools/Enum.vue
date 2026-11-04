<template>
	<WindowFrame
		id="enum"
		ref="frame"
		show-apply
		mode="center"
		@apply="onApply"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.enum.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="field-set input pad" id="enum-list-fieldset">
			<div class="legend">{{ t('components.enum-list.label') }}</div>
			<TreeList
				id="enum-list"
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
		<div class="field-set" id="enum-properties-fieldset">
			<div class="legend">{{ t('components.enum-properties-flex.label') }}</div>
			<div class="flex-box" id="enum-properties-flex" ref="panelRef">
				<div class="flex-item">
					<div class="text">{{ t('components.enum-name.label') }}</div>
					<TextBox
						:label="t('components.enum-name.label')"
						id="enum-name"
						v-tip="t('components.enum-name.tip')"
						ref="nameRef"
						menu="tag-localization"
						@input="onNameInput"
					/>
				</div>
				<div class="flex-item">
					<div class="text">{{ t('components.enum-value.label') }}</div>
					<TextBox
						:label="t('components.enum-value.label')"
						id="enum-value"
						:placeholder="t('components.enum-value.placeholder')"
						v-tip="t('components.enum-value.tip')"
						ref="valueRef"
						menu="tag-localization"
						@input="onValueInput"
					/>
				</div>
				<div class="flex-item" id="enum-spacing-box" />
				<div class="flex-item">
					<div class="text">{{ t('components.enum-note.label') }}</div>
					<TextArea
						:label="t('components.enum-note.label')"
						id="enum-note"
						v-tip="t('components.enum-note.tip')"
						ref="noteRef"
					/>
				</div>
			</div>
		</div>
		<TextBox id="enum-searcher" ref="searcherRef" name="search" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, onUnmounted, ref, type VNode } from 'vue';
import { useI18n } from 'vue-i18n';
import { Enum } from '@app/enum/enum-window.ts';
import {
	provideEnumHandles,
	resetEnumHandles,
	type EnumWindowHandles
} from '@app/composables/enum-handles';
import { GameLocal } from '@app/local/local-object.ts';
import type { YamiElement } from '@app/types/element-api';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { getEnumStore } from '@app/stores/enum';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const { t } = useI18n();

const nodeExtras = (item: unknown): VNode[] => {
	const node = item as { class?: string; id: string; value?: string; note?: string };
	const nodes: VNode[] = [];
	if (node.class === 'folder') {
		const store = getEnumStore();
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
		const value = node.value as string;
		nodes.push(
			h(
				'div',
				{ class: 'enum-init-text text' },
				value ? ` = ${GameLocal.replace(value)}` : ''
			)
		);
		if (node.note) {
			nodes.push(h('span', { class: ['node-icon', 'icon-note'] }, '\uf27b'));
		}
	}
	return nodes;
};

const nodeIconRenderer = (item: unknown): VNode[] => {
	const node = item as { class?: string };
	return [
		h('span', { class: ['node-icon', node.class === 'folder' ? 'icon-folder' : 'icon-string'] })
	];
};

const onListSelect = (event: Event & { value?: unknown }) => {
	Enum?.listSelect?.(event);
};
const onListRecord = (event: Event & { value?: unknown }) => {
	Enum?.listRecord?.(event);
};
const onListOpen = (event: Event & { value?: unknown }) => {
	Enum?.listOpen?.(event as MouseEvent);
};
const onListPopup = (event: Event & { value?: unknown }) => {
	Enum?.listPopup?.(event as Event & { clientX: number; clientY: number });
};
const onNameInput = (value: string) => {
	Enum?.nameInput?.({ target: { value } } as InputEvent & { target: HTMLInputElement });
};
const onValueInput = (value: string) => {
	Enum?.valueInput?.({ target: { value } } as InputEvent & { target: HTMLInputElement });
};

const onApply = () => {
	Enum?.apply?.();
};

const onConfirm = () => {
	Enum?.confirm?.(new Event('click'));
};

onMounted(() => {});

/**
 * 长期持有的 7 个节点一次交给单例（它把 list/panel/searcher/inputs 存成字段并跨 open/close 复用）。
 * 组件 ref 要取根元素：单例把它们当「带元素 API 的元素」用。
 */
const frame = ref<InstanceType<typeof WindowFrame> | null>(null);
const listRef = ref<unknown>(null);
const panelRef = ref<unknown>(null);
const nameRef = ref<unknown>(null);
const valueRef = ref<unknown>(null);
const noteRef = ref<unknown>(null);
const searcherRef = ref<unknown>(null);

const rootOf = (target: unknown): YamiElement | null => {
	const instance = target as { root?: unknown; $el?: unknown } | null;
	const el = instance?.root ?? instance?.$el ?? target;
	return el instanceof HTMLElement ? (el as YamiElement) : null;
};

let handles: EnumWindowHandles | null = null;

onMounted(() => {
	const root = rootOf(frame.value);
	const list = rootOf(listRef.value);
	const panel = rootOf(panelRef.value);
	const searcher = rootOf(searcherRef.value);
	const name = rootOf(nameRef.value);
	const value = rootOf(valueRef.value);
	const note = rootOf(noteRef.value);
	if (!root || !list || !panel || !searcher || !name || !value || !note) return;
	handles = { root, list, panel, searcher, name, value, note };
	provideEnumHandles(handles);
	onUnmounted(() => {
		if (handles) resetEnumHandles(handles);
	});
});
</script>

<style>
#enum {
	width: 572px;
	height: 700px;
}

#enum-list-fieldset {
	left: 10px;
	top: 10px;
	width: 320px;
	height: 622px;
}

#enum-list {
	font-family: var(--font-family-mono);
}

#enum-properties-fieldset {
	left: 340px;
	top: 10px;
	width: 222px;
	height: 622px;
}

#enum-properties-flex {
	flex-direction: column;
}

#enum-spacing-box {
	height: 292px;
}

#enum-note {
	height: 196px;
}

#enum-searcher {
	position: absolute;
	left: 10px;
	bottom: 10px;
	width: 258px;
}

#enum-confirm {
	right: 206px;
	bottom: 10px;
}

#enum-cancel {
	right: 108px;
	bottom: 10px;
}

#enum-apply {
	right: 10px;
	bottom: 10px;
}
</style>

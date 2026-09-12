<template>
	<WindowFrame id="enum"
				:ref="registryRef(enumEls, 'enum')" show-apply mode="center" @apply="onApply" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.enum.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="field-set input pad" id="enum-list-fieldset">
			<div class="legend">{{ t('components.enum-list.label') }}</div>
			<TreeList
				id="enum-list"
				:ref="registryRef(enumEls, 'enum-list')"
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
			<div class="flex-box" id="enum-properties-flex"
				:ref="registryRef(enumEls, 'enum-properties-flex')">
				<div class="flex-item">
					<div class="text">{{ t('components.enum-name.label') }}</div>
					<TextBox id="enum-name"
				:ref="registryRef(enumEls, 'enum-name')" menu="tag-localization" @input="onNameInput" />
				</div>
				<div class="flex-item">
					<div class="text">{{ t('components.enum-value.label') }}</div>
					<TextBox id="enum-value"
				:ref="registryRef(enumEls, 'enum-value')" menu="tag-localization" @input="onValueInput" />
				</div>
				<div class="flex-item" id="enum-spacing-box" />
				<div class="flex-item">
					<div class="text">{{ t('components.enum-note.label') }}</div>
					<TextArea id="enum-note"
				:ref="registryRef(enumEls, 'enum-note')" />
				</div>
			</div>
		</div>
		<TextBox id="enum-searcher"
				:ref="registryRef(enumEls, 'enum-searcher')" name="search" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import { useI18n } from 'vue-i18n';
import { Enum, enumEls } from '@app/enum/enum-window.ts';
import { GameLocal } from '@app/local/local-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import { registryRef } from '@app/utils/element-registry';
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

// P5b 批次 3：`enum-confirm` 由 WindowFrame 生成，改由 @confirm 驱动
const onConfirm = () => {
	Enum?.confirm?.(new Event('click'));
};

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/data.css 迁入组件（选择器为全局 id，不能用 scoped） */
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


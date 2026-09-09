<template>
	<WindowFrame id="event" show-apply class="opaque" @apply="onApply">
		<template #title
			><TitleBar id="event-title"
				>{{ t('components.event.title') }}
				<div class="maximize"></div>
				<div class="close"></div> </TitleBar
		></template>

		<div class="field-set input pad" id="event-open-fieldset">
			<div class="legend">{{ t('components.event-open-list.label') }}</div>
			<TreeList
				id="event-open-list"
				:node-extras="nodeExtras"
				:node-icon-renderer="nodeIconRenderer"
			/>
		</div>
		<div class="field-set input pad" id="event-commands-fieldset">
			<div class="legend">{{ t('components.event-commands-gutter-background.label') }}</div>
			<div class="box" id="event-commands-gutter-background" />
			<CommandList id="event-commands" />
			<div class="box" id="event-commands-gutter-outer">
				<div class="box" id="event-commands-gutter-inner" />
			</div>
		</div>
		<SelectBox id="event-type" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import { useI18n } from 'vue-i18n';
import { removeTextTags, parseEventType } from '@app/composables/useCommandParse.ts';
import { EventEditor } from '@app/commands/event-editor.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CommandList from '@app/components/common/CommandList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const { t } = useI18n();

const nodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as { filter?: string; type?: string };
	const element = container.parentNode as HTMLElement | null;
	element?.classList.add('event-open-item');
	if (node.filter === 'global') {
		element?.classList.add('global-event');
	} else {
		element?.classList.add('local-event');
	}
	let typeName = '';
	if (node.type !== 'common') {
		typeName = ' : ' + removeTextTags(parseEventType(node.filter + '-event', node.type!));
	}
	return [h('div', { class: 'event-init-text text' }, typeName)];
};

const nodeIconRenderer = (item: unknown): VNode[] => {
	return [
		h(
			'div',
			{
				class: 'event-close-button text',
				style: { pointerEvents: 'auto' },
				onClick: () => {
					EventEditor?.list?.close?.(
						item as Parameters<typeof EventEditor.list.close>[0]
					);
				}
			},
			'×'
		)
	];
};

const onApply = () => {
	EventEditor?.apply?.();
};

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
#event {
	width: 1280px;
	height: 700px;
}

#event-open-fieldset {
	left: 10px;
	top: 10px;
	width: 280px;
	bottom: 10px;
}

#event-commands-fieldset {
	left: 300px;
	top: 10px;
	right: 10px;
	bottom: 40px;
}

#event-commands-gutter-background {
	position: absolute;
	top: 10px;
	bottom: 10px;
	width: 48px;
	pointer-events: none;
	border-right: var(--command-line-number-color);
}

#event-commands-gutter-outer {
	position: absolute;
	top: 10px;
	bottom: 10px;
	width: 48px;
	overflow: hidden;
	pointer-events: none;
}

#event-commands-gutter-inner {
	display: flex;
	flex-direction: column;
	position: absolute;
	/* margin-top: -20px; */
	width: 32px;
}

#event-type {
	position: absolute;
	left: 300px;
	bottom: 10px;
	width: 200px;
}

#event-confirm {
	right: 206px;
	bottom: 10px;
}

#event-cancel {
	right: 108px;
	bottom: 10px;
}

#event-apply {
	right: 10px;
	bottom: 10px;
}
</style>


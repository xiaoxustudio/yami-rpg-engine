<template>
	<WindowFrame id="event" show-apply class="opaque" @apply="onApply">
		<template #title><TitleBar id="event-title"
			>{{ t('components.event.title') }}<div class="maximize"></div>
			<div class="close"></div>
		</TitleBar></template>
		
			<div class="field-set input pad" id="event-open-fieldset">
				<div class="legend">{{ t('components.event-open-list.label') }}</div>
				<TreeList id="event-open-list" :node-extras="nodeExtras" :node-icon-renderer="nodeIconRenderer" />
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
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CommandList from '@app/components/common/CommandList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

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
		typeName =
			' : ' +
			removeTextTags(parseEventType(node.filter + '-event', node.type!));
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
					EventEditor?.list?.close?.(item as Parameters<typeof EventEditor.list.close>[0]);
				}
			},
			'×'
		)
	];
};

const onApply = () => {
	EventEditor?.apply?.();
};

onMounted(() => {


});
</script>

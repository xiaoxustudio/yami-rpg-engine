<template>
	<!-- 队伍窗口 -->
	<WindowFrame id="team">
		<template #title><TitleBar>{{ t('components.team.title') }}<div class="close" /></TitleBar></template>
		
			<div class="field-set input pad" id="team-list-fieldset">
				<TreeList
					id="team-list"
					:node-extras="nodeExtras"
					:node-icon-renderer="nodeIconRenderer"
					@select="onListSelect"
					@popup="onListPopup"
					@change="onListChange"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import { useI18n } from 'vue-i18n';
import { Team } from '@app/data/team-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TreeList from '@app/components/common/TreeList.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

const nodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as { id: string };
	const nodes: VNode[] = [];
	container.parentNode?.classList.add('plain');
	const selection = Team.list?.read() as
		| {
				relations?: Record<string, number>;
				collisions?: Record<string, number>;
		  }
		| null
		| undefined;
	let relationClass = '';
	let relationText = '';
	const relation = selection?.relations?.[node.id];
	if (relation === 0) {
		relationClass = ' enemy';
		relationText = '\uf119';
	} else if (relation === 1) {
		relationClass = ' friend';
		relationText = '\uf118';
	}
	nodes.push(h('div', { class: `team-relation-mark text${relationClass}` }, relationText));
	const collision = selection?.collisions?.[node.id];
	nodes.push(
		h('div', { class: `team-collision-mark text${collision === 1 ? ' on' : ''}` }, '\uf066')
	);
	return nodes;
};

const nodeIconRenderer = (item: unknown): VNode[] => {
	const node = item as { color?: string };
	const color = node.color ?? '';
	const r = parseInt(color.slice(0, 2), 16);
	const g = parseInt(color.slice(2, 4), 16);
	const b = parseInt(color.slice(4, 6), 16);
	const a = parseInt(color.slice(6, 8), 16) / 255;
	return [
		h('node-icon', {
			class: 'team-icon',
			style: { backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})`, pointerEvents: 'auto' }
		})
	];
};

const onListSelect = (event: Event & { value?: unknown }) => {
	Team?.listSelect?.(event);
};
const onListPopup = (event: PointerEvent & { value?: unknown }) => {
	Team?.listPopup?.(event);
};
const onListChange = (event: Event & { value?: unknown }) => {
	Team?.listChange?.(event);
};

onMounted(() => {
});
</script>

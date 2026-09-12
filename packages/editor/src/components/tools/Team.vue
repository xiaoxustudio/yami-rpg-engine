<template>
	<!-- 队伍窗口 -->
	<WindowFrame id="team"
				:ref="registryRef(composableEls, 'team')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.team.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="field-set input pad" id="team-list-fieldset">
			<TreeList
				id="team-list"
				:ref="registryRef(composableEls, 'team-list')"
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
import { composableEls } from '@app/composables/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { Team } from '@app/data/team-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TreeList from '@app/components/common/TreeList.vue';

const { t } = useI18n();

const nodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as { id: string };
	const nodes: VNode[] = [];
	(container.parentNode as HTMLElement | null)?.classList.add('plain');
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
		h('span', {
			class: ['node-icon', 'team-icon'],
			style: { backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})`, pointerEvents: 'auto' }
		})
	];
};

const onListSelect = (event: Event & { value?: unknown }) => {
	Team?.listSelect?.(event);
};
const onListPopup = (event: Event & { value?: unknown }) => {
	Team?.listPopup?.(event as PointerEvent & { value?: unknown });
};
const onListChange = (event: Event & { value?: unknown }) => {
	Team?.listChange?.(event);
};

// 确认按钮由 WindowFrame → YMFormButtons 生成（模板里没有、注册表取不到）→ 由 SFC 的 @confirm 驱动
const onConfirm = () => {
	Team?.confirm?.(new Event('click'));
};

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/data.css 迁入组件（选择器为全局 id，不能用 scoped） */
#team {
	width: 304px;
	height: 420px;
}

#team-list-fieldset {
	left: 10px;
	top: 10px;
	width: 284px;
	height: 342px;
}

#team-list {
	font-family: var(--font-family-mono);
}

#team-confirm {
	right: 108px;
	bottom: 10px;
}

#team-cancel {
	right: 10px;
	bottom: 10px;
}
</style>


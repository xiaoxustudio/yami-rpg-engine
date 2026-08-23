<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import {
	YMSelectBox,
	createSelectListElement,
	type SelectItem,
	type SelectListApi,
	type SelectTarget
} from '@ui-kit';

const items: SelectItem[] = [
	{ value: 'fire', name: '火焰', tip: '红莲业火' },
	{ value: 'water', name: '水流', tip: '碧波万顷' },
	{ value: 'earth', name: '大地' },
	{ value: 'wind', name: '狂风' },
	{ value: 'ice', name: '冰霜' },
	{ value: 'thunder', name: '雷电' },
	{ value: 'light', name: '圣光' },
	{ value: 'dark', name: '暗影' }
];

const selected = ref('fire');
const targetBox = ref<{ root: HTMLElement | null } | null>(null);
const listHost = ref<HTMLElement | null>(null);

let list: SelectListApi | null = null;

onMounted(() => {
	list = createSelectListElement() as SelectListApi;
	list.createItems(items);
	listHost.value?.appendChild(list);
});

onBeforeUnmount(() => {
	list?.close();
	list = null;
});

const openList = (): void => {
	const target = targetBox.value?.root;
	if (!target || !list) return;
	list.open(target as SelectTarget);
};
</script>

<template>
	<section class="demo">
		<h2>YMSelectList</h2>
		<div class="row">
			<div class="box">
				<YMSelectBox
					ref="targetBox"
					v-model="selected"
					:items="items"
					:popup="false"
					@open="openList"
				/>
			</div>
			<span class="hint">点击/回车打开浮动列表, 当前: {{ selected }}</span>
		</div>
		<div ref="listHost" class="list-host" />
	</section>
</template>

<style scoped>
.demo {
	display: flex;
	flex-direction: column;
	gap: var(--ym-space-3);
	padding: var(--ym-space-4);
	background: var(--ym-color-surface);
	border: 1px solid var(--ym-color-border);
	border-radius: var(--ym-radius-md);
}

.row {
	display: flex;
	align-items: center;
	gap: var(--ym-space-3);
	flex-wrap: wrap;
}

.box {
	width: 180px;
}

.list-host {
	position: fixed;
	pointer-events: none;
}

.hint {
	margin: 0;
	font-size: var(--ym-font-size-sm);
	color: var(--ym-color-text-unit);
}
</style>

<template>
	<YMConfirmation
		ref="ym"
		:message="store.message"
		:items="store.items"
		:content-style="contentStyle"
		@confirm="store.confirmButton($event)"
	/>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { YMConfirmation } from '@ui-kit';
import { getConfirmationStore } from '@app/stores/confirmation';
import { measureText } from '@app/utils/dom';
import { registerElement } from '@app/utils/element-registry';
import { windowShellEls } from '@app/tools/window-object.ts';

const store = getConfirmationStore();

const ym = ref<{ focusFirstButton(): void; $el?: HTMLElement } | null>(null);

// 本窗口直接用 ui-kit 的 YMWindowFrame（id="confirmation"），不经过 WindowFrame.vue，
// 因此要自己登记——`Window.open('confirmation')` 现在从 windowShellEls 取帧。
onMounted(() => {
	const root = ym.value?.$el;
	if (root) registerElement(windowShellEls, 'confirmation', root);
});

const contentStyle = computed(() => {
	const measure = measureText(store.message);
	const textWidth = measure.width;
	const textHeight = measure.lines * 20;
	const buttonWidth = store.items.length * 98 - 10;
	const contentWidth = Math.max(textWidth, buttonWidth) + 20;
	const contentHeight = textHeight + 50;
	return {
		width: `${contentWidth}px`,
		height: `${contentHeight + 24}px`
	};
});

watch(
	() => store.open,
	(open) => {
		if (open && store.items.length > 0) {
			ym.value?.focusFirstButton();
		}
	}
);
</script>

<style>
/* 不能用 scoped：选择器需命中子组件内部生成的元素 */
#confirmation {
	width: 304px;
	height: 98px;
}

#confirmation-message {
	display: block;
	margin: 10px;
	line-height: 20px;
	white-space: pre;
}

#confirmation-button-frame {
	display: flex;
	column-gap: 10px;
	position: absolute;
	right: 10px;
	bottom: 10px;
}

#confirmation-button-0,
#confirmation-button-1,
#confirmation-button-2 {
	position: static;
}
</style>

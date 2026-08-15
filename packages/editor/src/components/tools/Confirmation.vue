<template>
	<WindowFrame id="confirmation" no-buttons mode="center" :style="contentStyle">
		<template #title><TitleBar>
			<div class="close" />
		</TitleBar></template>
		
			<div class="text" id="confirmation-message">{{ store.message }}</div>
			<div class="box" id="confirmation-button-frame">
				<button
					v-for="index in buttonIndexes"
					:key="index"
					:id="`confirmation-button-${index}`"
					v-show="store.items[index]"
					:ref="(element) => setButtonRef(element, index)"
					@click="store.confirmButton(index)"
				>{{ store.items[index]?.label }}</button>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted, shallowRef, watch } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useConfirmationStore } from '@app/stores/confirmation';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { measureText } from '@/util/dom';
import { getFocus } from '@/util/element-utils';

const inspector = useInspectorStore();
const local = useLocalStore();
const store = useConfirmationStore();

const buttonIndexes = [0, 1, 2];
const buttonRefs = shallowRef<HTMLElement[]>([]);

function setButtonRef(element: unknown, index: number) {
	if (element) {
		buttonRefs.value[index] = element as HTMLElement;
	}
}

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
			getFocus(buttonRefs.value[0]);
		}
	}
);

onMounted(() => {


});
</script>

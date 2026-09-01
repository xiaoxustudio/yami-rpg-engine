<template>
	<WindowFrame ref="frame" id="arrayList" mode="center">
		<template #title
			><TitleBar
				>Array
				<div class="close" /></TitleBar
		></template>

		<ParamList id="arrayList-list" ref="elList" v-focus @change="onListChange" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useArrayWindow } from '@app/composables/useArrayWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { on } from '@app/utils/element-utils';
import ParamList from '@app/components/common/ParamList.vue';

const arrayWindow = useArrayWindow();
const form = arrayWindow.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);
const elList = ref<InstanceType<typeof ParamList> | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onListChange = () => {
	form.values = elList.value?.read() ?? form.values;
	arrayWindow.markChanged();
};

watch(
	() => form.values,
	(values) => {
		if (elList.value) {
			elList.value.write(values);
		}
	},
	{ flush: 'sync' }
);

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => arrayWindow.onWindowClosed());
	}
});
</script>

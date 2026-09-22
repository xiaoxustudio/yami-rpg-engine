<template>
	<WindowFrame ref="frame" id="arrayList" mode="center" @confirm="onConfirm">
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
import { composableEls } from '@app/composables/element-registry';
import { registerElement } from '@app/utils/element-registry';
import { useArrayWindow } from '@app/composables/useArrayWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import ParamList from '@app/components/common/ParamList.vue';

const arrayWindow = useArrayWindow();

// P5b 批次 4：arrayList-confirm 由 WindowFrame 生成 → 改由 @confirm 调 composable 的 confirm
const onConfirm = () => {
	arrayWindow.confirm?.();
};
const form = arrayWindow.form;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);
const elList = ref<InstanceType<typeof ParamList> | null>(null);

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
	registerElement(composableEls, 'arrayList-list', elList.value);
	registerElement(composableEls, 'arrayList', frame.value);
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => arrayWindow.onWindowClosed());
	}
});
</script>

<style>
/* 窗口样式迁移：由 Project/css/data.css 迁入组件（选择器为全局 id，不能用 scoped） */
#arrayList {
	width: 340px;
	height: 480px;
}

#arrayList-list {
	position: absolute;
	left: 10px;
	top: 10px;
	width: 320px;
	height: 402px;
}

#arrayList-confirm {
	right: 108px;
	bottom: 10px;
}

#arrayList-cancel {
	right: 10px;
	bottom: 10px;
}

#arrayList-number {
	width: 300px;
	height: 98px;
}

#arrayList-number-value {
	position: absolute;
	left: 10px;
	top: 10px;
	width: 280px;
}

#arrayList-number-confirm {
	right: 108px;
	bottom: 10px;
}

#arrayList-number-cancel {
	right: 10px;
	bottom: 10px;
}

#arrayList-string {
	width: 300px;
	height: 122px;
}

#arrayList-string-value {
	position: absolute;
	left: 10px;
	top: 10px;
	width: 280px;
	height: 44px;
}

#arrayList-string-confirm {
	right: 108px;
	bottom: 10px;
}

#arrayList-string-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

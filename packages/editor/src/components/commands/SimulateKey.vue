<template>
	<WindowFrame id="simulateKey" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.simulateKey.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Operation</div>
			<SelectBox id="simulateKey-operation"
				v-tip="t('components.simulateKey-operation.tip')"
				:ref="registryRef(fieldEls, 'simulateKey-operation')" v-focus v-model="form.operation" />
			<div class="text">Key Code</div>
			<KeyboardBox id="simulateKey-keycode"
				v-tip="t('components.simulateKey-keycode.tip')" @input="onKeycode" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSimulateKeyCommandSchema } from '@app/composables/useSimulateKeyCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import KeyboardBox from '@app/components/common/KeyboardBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSimulateKeyCommandSchema();

const onKeycode = (value: number) => {
	form.keycode = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('simulateKey-operation')?.loadItems?.([
		{ name: 'Click', value: 'click' },
		{ name: 'Press', value: 'press' },
		{ name: 'Release', value: 'release' }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#simulateKey {
	width: 324px;
	height: 122px;
}

#simulateKey-confirm {
	right: 108px;
	bottom: 10px;
}

#simulateKey-cancel {
	right: 10px;
	bottom: 10px;
}

</style>

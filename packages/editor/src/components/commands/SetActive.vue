<template>
	<WindowFrame id="setActive" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setActive.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setActive-actor.label') }}</div>
			<CustomBox id="setActive-actor"
				v-tip="t('components.setActive-actor.tip')" v-focus type="actor" v-model="form.actor" />
			<div class="text">{{ t('components.setActive-active.label') }}</div>
			<SelectBox id="setActive-active"
				v-tip="t('components.setActive-active.tip')"
				:ref="registryRef(fieldEls, 'setActive-active')" v-model="form.active" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetActiveCommandSchema } from '@app/composables/commands/useSetActiveCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetActiveCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('setActive-active')?.loadItems?.([
		{ name: t('command.setActive.active.true') || 'Active', value: true },
		{ name: t('command.setActive.active.false') || 'Inactive', value: false }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setActive {
	width: 324px;
	height: 122px;
}

#setActive-confirm {
	right: 108px;
	bottom: 10px;
}

#setActive-cancel {
	right: 10px;
	bottom: 10px;
}

</style>

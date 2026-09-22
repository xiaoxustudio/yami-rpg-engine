<template>
	<WindowFrame id="nestElement" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.nestElement.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.nestElement-parent.label') }}</div>
			<CustomBox
				id="nestElement-parent"
				v-tip="t('components.nestElement-parent.tip')"
				v-focus
				type="element"
				v-model="form.parent"
			/>
			<div class="text">{{ t('components.nestElement-child.label') }}</div>
			<CustomBox
				id="nestElement-child"
				v-tip="t('components.nestElement-child.tip')"
				type="element"
				v-model="form.child"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useNestElementCommandSchema } from '@app/composables/commands/useNestElementCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useNestElementCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#nestElement {
	width: 324px;
	height: 122px;
}

#nestElement-confirm {
	right: 108px;
	bottom: 10px;
}

#nestElement-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

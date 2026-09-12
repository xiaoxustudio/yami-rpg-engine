<template>
	<WindowFrame id="deleteVariable" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.deleteVariable.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Variable</div>
			<CustomBox
				id="deleteVariable-variable"
				v-tip="t('components.deleteVariable-variable.tip')"
				v-focus
				type="variable"
				filter="deletable"
				v-model="form.variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useDeleteVariableCommandSchema } from '@app/composables/commands/useDeleteVariableCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useDeleteVariableCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#deleteVariable {
	width: 324px;
	height: 98px;
}

#deleteVariable-confirm {
	right: 108px;
	bottom: 10px;
}

#deleteVariable-cancel {
	right: 10px;
	bottom: 10px;
}

</style>

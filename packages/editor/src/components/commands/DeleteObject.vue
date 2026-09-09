<template>
	<WindowFrame id="deleteObject" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.deleteObject.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Object</div>
			<CustomBox id="deleteObject-object" v-focus type="object" v-model="form.object" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useDeleteObjectCommandSchema } from '@app/composables/commands/useDeleteObjectCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useDeleteObjectCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#deleteObject {
	width: 324px;
	height: 98px;
}

#deleteObject-confirm {
	right: 108px;
	bottom: 10px;
}

#deleteObject-cancel {
	right: 10px;
	bottom: 10px;
}

</style>

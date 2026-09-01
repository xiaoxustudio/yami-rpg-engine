<template>
	<WindowFrame id="activateScene" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.activateScene.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Scene</div>
			<SelectBox id="activateScene-pointer" v-focus v-model="form.pointer" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useActivateSceneCommandSchema } from '@app/composables/commands/useActivateSceneCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useActivateSceneCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#activateScene-pointer')?.loadItems?.([
		{ name: 'Scene A', value: 0 },
		{ name: 'Scene B', value: 1 }
	]);
});
</script>

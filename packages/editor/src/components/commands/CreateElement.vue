<template>
	<WindowFrame id="createElement" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.createElement.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Operation</div>
			<SelectBox id="createElement-operation" v-focus v-model="form.operation" />
			<div class="text">Parent</div>
			<CustomBox id="createElement-parent" type="element" v-model="form.parent" />
			<div class="text">UI Elements</div>
			<CustomBox
				id="createElement-uiId"
				v-focus
				type="file"
				filter="ui"
				v-model="form.uiId"
			/>
			<div class="text">UI Element</div>
			<CustomBox
				id="createElement-presetId"
				v-focus
				type="preset-element"
				v-model="form.presetId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCreateElementCommandSchema } from '@app/composables/commands/useCreateElementCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useCreateElementCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#createElement-operation')?.loadItems?.([
		{ name: 'Append All to Root', value: 'append-all-to-root' },
		{ name: 'Append One to Root', value: 'append-one-to-root' },
		{ name: 'Append All to Element', value: 'append-all-to-element' },
		{ name: 'Append One to Element', value: 'append-one-to-element' }
	]);
	$('#createElement-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'append-all-to-root',
				targets: [$('#createElement-uiId')]
			},
			{
				case: 'append-one-to-root',
				targets: [$('#createElement-presetId')]
			},
			{
				case: 'append-all-to-element',
				targets: [$('#createElement-parent'), $('#createElement-uiId')]
			},
			{
				case: 'append-one-to-element',
				targets: [$('#createElement-parent'), $('#createElement-presetId')]
			}
		]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#createElement {
	width: 324px;
	height: 146px;
}

#createElement-confirm {
	right: 108px;
	bottom: 10px;
}

#createElement-cancel {
	right: 10px;
	bottom: 10px;
}

</style>

<template>
	<WindowFrame id="setPointerEventRoot" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setPointerEventRoot.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Operation</div>
			<SelectBox id="setPointerEventRoot-operation" v-focus v-model="form.operation" />
			<div class="text">Element</div>
			<CustomBox
				id="setPointerEventRoot-element"
				type="element"
				v-model="form.element"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetPointerEventRootCommandSchema } from '@app/composables/commands/useSetPointerEventRootCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetPointerEventRootCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setPointerEventRoot-operation')?.loadItems?.([
		{ name: 'Add Root Element', value: 'add' },
		{ name: 'Remove Root Element', value: 'remove' },
		{ name: 'Remove The Latest Root Element', value: 'remove-latest' },
		{ name: 'Reset', value: 'reset' }
	]);
	$('#setPointerEventRoot-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['add', 'remove'],
				targets: [$('#setPointerEventRoot-element')]
			}
		]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setPointerEventRoot {
	width: 324px;
	height: 122px;
}

#setPointerEventRoot-confirm {
	right: 108px;
	bottom: 10px;
}

#setPointerEventRoot-cancel {
	right: 10px;
	bottom: 10px;
}

</style>

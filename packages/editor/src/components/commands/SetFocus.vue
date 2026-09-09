<template>
	<WindowFrame id="setFocus" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setFocus.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Operation</div>
			<SelectBox id="setFocus-operation" v-focus v-model="form.operation" />
			<div class="text">Element</div>
			<CustomBox id="setFocus-element" type="element" v-model="form.element" />
			<div class="text">Mode</div>
			<SelectBox id="setFocus-mode" v-model="form.mode" />
			<div class="text">Cancelable</div>
			<CheckBox id="setFocus-cancelable" class="standard large" v-model="cancelable" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetFocusCommandSchema } from '@app/composables/commands/useSetFocusCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetFocusCommandSchema();

const cancelable = computed({
	get: () => form.cancelable as boolean,
	set: (value) => {
		form.cancelable = value;
	}
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setFocus-operation')?.loadItems?.([
		{ name: 'Add Focus', value: 'add' },
		{ name: 'Remove Focus', value: 'remove' },
		{ name: 'Remove The Latest Focus', value: 'remove-latest' },
		{ name: 'Reset', value: 'reset' }
	]);
	$('#setFocus-mode')?.loadItems?.([
		{ name: 'Control Child Buttons', value: 'control-child-buttons' },
		{
			name: 'Control Descendant Buttons',
			value: 'control-descendant-buttons'
		}
	]);
	$('#setFocus-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'add',
				targets: [$('#setFocus-element'), $('#setFocus-mode'), $('#setFocus-cancelable')]
			},
			{ case: 'remove', targets: [$('#setFocus-element')] }
		]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setFocus {
	width: 324px;
	height: 170px;
}

#setFocus-confirm {
	right: 108px;
	bottom: 10px;
}

#setFocus-cancel {
	right: 10px;
	bottom: 10px;
}

</style>

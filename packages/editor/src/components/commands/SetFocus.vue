<template>
	<WindowFrame id="setFocus" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setFocus.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Operation</div>
			<SelectBox id="setFocus-operation"
				:ref="registryRef(fieldEls, 'setFocus-operation')" v-focus v-model="form.operation" />
			<div class="text">Element</div>
			<CustomBox id="setFocus-element"
				:ref="registryRef(fieldEls, 'setFocus-element')" type="element" v-model="form.element" />
			<div class="text">Mode</div>
			<SelectBox id="setFocus-mode"
				:ref="registryRef(fieldEls, 'setFocus-mode')" v-model="form.mode" />
			<div class="text">Cancelable</div>
			<CheckBox id="setFocus-cancelable"
				:ref="registryRef(fieldEls, 'setFocus-cancelable')" class="standard large" v-model="cancelable" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetFocusCommandSchema } from '@app/composables/commands/useSetFocusCommandSchema';
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
	fieldEls.get('setFocus-operation')?.loadItems?.([
		{ name: 'Add Focus', value: 'add' },
		{ name: 'Remove Focus', value: 'remove' },
		{ name: 'Remove The Latest Focus', value: 'remove-latest' },
		{ name: 'Reset', value: 'reset' }
	]);
	fieldEls.get('setFocus-mode')?.loadItems?.([
		{ name: 'Control Child Buttons', value: 'control-child-buttons' },
		{
			name: 'Control Descendant Buttons',
			value: 'control-descendant-buttons'
		}
	]);
	fieldEls.get('setFocus-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'add',
				targets: [fieldEls.get('setFocus-element'), fieldEls.get('setFocus-mode'), fieldEls.get('setFocus-cancelable')]
			},
			{ case: 'remove', targets: [fieldEls.get('setFocus-element')] }
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

<template>
	<WindowFrame id="changeActorState" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorState.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="changeActorState-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Operation</div>
			<SelectBox id="changeActorState-operation"
				:ref="registryRef(fieldEls, 'changeActorState-operation')" v-model="form.operation" />
			<div class="text">State</div>
			<CustomBox
				id="changeActorState-stateId"
				:ref="registryRef(fieldEls, 'changeActorState-stateId')"
				v-focus
				type="file"
				filter="state"
				v-model="form.stateId"
			/>
			<div class="text">State</div>
			<CustomBox id="changeActorState-state"
				:ref="registryRef(fieldEls, 'changeActorState-state')" type="state" v-model="form.state" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorStateCommandSchema } from '@app/composables/commands/useChangeActorStateCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangeActorStateCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('changeActorState-operation')?.loadItems?.([
		{ name: t('command.changeActorState.add') || 'Add', value: 'add' },
		{ name: t('command.changeActorState.remove') || 'Remove', value: 'remove' },
		{
			name: t('command.changeActorState.remove-instance') || 'Remove Instance',
			value: 'remove-instance'
		}
	]);
	fieldEls.get('changeActorState-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['add', 'remove'],
				targets: [fieldEls.get('changeActorState-stateId')]
			},
			{
				case: 'remove-instance',
				targets: [fieldEls.get('changeActorState-state')]
			}
		]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#changeActorState {
	width: 324px;
	height: 146px;
}

#changeActorState-confirm {
	right: 108px;
	bottom: 10px;
}

#changeActorState-cancel {
	right: 10px;
	bottom: 10px;
}

</style>

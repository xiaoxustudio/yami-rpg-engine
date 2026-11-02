<template>
	<WindowFrame id="setLoop" :ref="controlRef('setLoop')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setLoop.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setLoop-type.label') }}</div>
			<SelectBox
				:label="t('components.setLoop-type.label')"
				id="setLoop-type"
				v-tip="t('components.setLoop-type.tip')"
				:ref="controlRef('setLoop-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.setLoop-loop.label') }}</div>
			<SelectBox
				:label="t('components.setLoop-loop.label')"
				id="setLoop-loop"
				v-tip="t('components.setLoop-loop.tip')"
				:ref="controlRef('setLoop-loop')"
				v-model="form.loop"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetLoopCommandSchema } from '@app/composables/commands/useSetLoopCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'setLoop' | 'setLoop-loop' | 'setLoop-type';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetLoopCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	controls['setLoop-type']?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' }
	]);
	useLocalizedOptions(
		'setLoop-loop',
		[false, true],
		(items) => controls['setLoop-loop']?.loadItems?.(items),
		{ false: 'command.setLoop.once', true: 'command.setLoop.loop' }
	);
});
</script>

<style>
#setLoop {
	width: 324px;
	height: 122px;
}

#setLoop-confirm {
	right: 108px;
	bottom: 10px;
}

#setLoop-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

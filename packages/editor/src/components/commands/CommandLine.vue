<template>
	<WindowFrame id="commandLine" :ref="controlRef('commandLine')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.commandLine.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.commandLine-type.label') }}</div>
			<SelectBox
				:label="t('components.commandLine-type.label')"
				id="commandLine-type"
				:ref="controlRef('commandLine-type')"
				v-model="form.type"
			/>
			<div class="text">{{ t('components.commandLine-key.label') }}</div>
			<StringVar
				id="commandLine-key"
				v-tip="t('components.commandLine-key.tip')"
				:ref="controlRef('commandLine-key')"
				v-focus
				v-model="form.key"
			/>
			<div class="text">{{ t('components.commandLine-value.label') }}</div>
			<StringVar
				id="commandLine-value"
				v-tip="t('components.commandLine-value.tip')"
				:ref="controlRef('commandLine-value')"
				v-model="form.value"
			/>
			<div class="text">{{ t('components.commandLine-variable.label') }}</div>
			<CustomBox
				id="commandLine-variable"
				v-tip="t('components.commandLine-variable.tip')"
				:ref="controlRef('commandLine-variable')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCommandLineCommandSchema } from '@app/composables/commands/useCommandLineCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'commandLine'
	| 'commandLine-key'
	| 'commandLine-type'
	| 'commandLine-value'
	| 'commandLine-variable';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useCommandLineCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions(
		'commandLine-type',
		['get', 'rm', 'set', 'has'],
		(items) => controls['commandLine-type']?.loadItems?.(items),
		{
			get: 'command.commandLine.get',
			rm: 'command.commandLine.rm',
			set: 'command.commandLine.set',
			has: 'command.commandLine.has'
		}
	);
	controls['commandLine-type']?.enableHiddenMode?.();
	controls['commandLine-type']?.relate?.([
		{
			case: 'get',
			targets: [
				controlRoot(controls['commandLine-key']),
				controlRoot(controls['commandLine-variable'])
			]
		},
		{
			case: 'rm',
			targets: [
				controlRoot(controls['commandLine-key']),
				controlRoot(controls['commandLine-value'])
			]
		},
		{
			case: 'set',
			targets: [
				controlRoot(controls['commandLine-key']),
				controlRoot(controls['commandLine-value'])
			]
		},
		{
			case: 'has',
			targets: [
				controlRoot(controls['commandLine-key']),
				controlRoot(controls['commandLine-variable'])
			]
		}
	]);
});
</script>

<style>
#commandLine {
	width: 324px;
	height: 146px;
}

#commandLine-confirm {
	right: 108px;
	bottom: 10px;
}

#commandLine-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

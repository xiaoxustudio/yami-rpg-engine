<template>
	<WindowFrame id="commandLine" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.commandLine.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Type</div>
			<SelectBox id="commandLine-type" v-model="form.type" @write="onType" />
			<div class="text">Key</div>
			<StringVar id="commandLine-key" v-model="form.key" />
			<div class="text">Value</div>
			<StringVar id="commandLine-value" v-model="form.value" />
			<div class="text">Variable</div>
			<CustomBox
				id="commandLine-variable"
				type="variable"
				filter="object"
				@input="onVariable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCommandLineCommandSchema } from '@app/composables/commands/useCommandLineCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useCommandLineCommandSchema();

const onVariable = (value: unknown) => {
	form.variable = value;
};

const onType = (value: unknown) => {
	form.type = value as string;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#commandLine-type')?.loadItems?.([
		{ name: t('command.commandLine.get') || 'get', value: 'get' },
		{ name: t('command.commandLine.rm') || 'rm', value: 'rm' },
		{ name: t('command.commandLine.set') || 'set', value: 'set' },
		{ name: t('command.commandLine.has') || 'has', value: 'has' }
	]);
	$('#commandLine-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'get',
				targets: [$('#commandLine-key'), $('#commandLine-variable')]
			},
			{
				case: 'rm',
				targets: [$('#commandLine-key'), $('#commandLine-value')]
			},
			{
				case: 'set',
				targets: [$('#commandLine-key'), $('#commandLine-value')]
			},
			{
				case: 'has',
				targets: [$('#commandLine-key'), $('#commandLine-variable')]
			}
		]);
});
</script>

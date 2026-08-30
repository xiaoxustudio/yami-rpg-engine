<template>
	<WindowFrame id="fixAngle" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.fixAngle.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="fixAngle-actor" type="actor" @input="onActor" />
			<div class="text">State</div>
			<SelectBox id="fixAngle-fixed" v-model="form.fixed" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFixAngleCommandSchema } from '@app/composables/commands/useFixAngleCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useFixAngleCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#fixAngle-fixed')?.loadItems?.([
		{ name: t('command.fixAngle.fixed.true') || 'Fixed', value: true },
		{ name: t('command.fixAngle.fixed.false') || 'Unfixed', value: false }
	]);
});
</script>

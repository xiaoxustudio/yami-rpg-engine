<template>
	<WindowFrame id="transition" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.transition.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Write to Variable</div>
			<CustomBox
				id="transition-variable"
				v-focus
				type="variable"
				filter="number"
				v-model="form.variable"
			/>
			<div class="text">Start Value</div>
			<NumberVar
				id="transition-start"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.start"
			/>
			<div class="text">End Value</div>
			<NumberVar
				id="transition-end"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.end"
			/>
			<div class="text">Easing</div>
			<SelectBox id="transition-easingId" name="easing" v-model="form.easingId" />
			<div class="text">Duration</div>
			<NumberVar
				id="transition-duration"
				v-focus
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { $ } from '@app/utils/dom';
import { on } from '@app/utils/element-utils';
import { useTransitionCommandSchema } from '@app/composables/commands/useTransitionCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, open, windowClosed } = useTransitionCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	on($('#transition'), 'open', () => open());
	on($('#transition'), 'closed', () => windowClosed(new Event('closed')));
});
</script>

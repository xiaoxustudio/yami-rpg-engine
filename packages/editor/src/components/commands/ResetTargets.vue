<template>
	<WindowFrame id="resetTargets" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.resetTargets.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.resetTargets-actor.label') }}</div>
			<CustomBox
				id="resetTargets-actor"
				v-tip="t('components.resetTargets-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useResetTargetsCommandSchema } from '@app/composables/commands/useResetTargetsCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useResetTargetsCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
#resetTargets {
	width: 324px;
	height: 98px;
}

#resetTargets-confirm {
	right: 108px;
	bottom: 10px;
}

#resetTargets-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

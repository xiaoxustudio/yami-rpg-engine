<template>
	<WindowFrame id="setTarget" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTarget.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setTarget-actor.label') }}</div>
			<CustomBox
				id="setTarget-actor"
				v-tip="t('components.setTarget-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSetTargetCommandSchema } from '@app/composables/commands/useSetTargetCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useSetTargetCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
#setTarget {
	width: 324px;
	height: 98px;
}

#setTarget-confirm {
	right: 108px;
	bottom: 10px;
}

#setTarget-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

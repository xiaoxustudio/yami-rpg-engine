<template>
	<WindowFrame id="removeTarget" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.removeTarget.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.removeTarget-actor.label') }}</div>
			<CustomBox
				id="removeTarget-actor"
				v-tip="t('components.removeTarget-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.removeTarget-target.label') }}</div>
			<CustomBox
				id="removeTarget-target"
				v-tip="t('components.removeTarget-target.tip')"
				type="actor"
				v-model="form.target"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRemoveTargetCommandSchema } from '@app/composables/commands/useRemoveTargetCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { t } = useI18n();

const { form, save } = useRemoveTargetCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
#removeTarget {
	width: 324px;
	height: 122px;
}

#removeTarget-confirm {
	right: 108px;
	bottom: 10px;
}

#removeTarget-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

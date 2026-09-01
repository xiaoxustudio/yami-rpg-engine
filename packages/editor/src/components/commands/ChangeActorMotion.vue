<template>
	<WindowFrame id="changeActorMotion" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changeActorMotion.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="changeActorMotion-actor" v-focus type="actor" v-model="form.actor" />
			<div class="text">Type</div>
			<SelectBox id="changeActorMotion-type" v-model="form.type" />
			<div class="text">Motion</div>
			<CustomBox id="changeActorMotion-motion" type="enum-string" v-model="form.motion" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangeActorMotionCommandSchema } from '@app/composables/commands/useChangeActorMotionCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangeActorMotionCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#changeActorMotion-type')?.loadItems?.([
		{ name: t('command.changeActorMotion.type.idle') || 'Idle', value: 'idle' },
		{ name: t('command.changeActorMotion.type.move') || 'Move', value: 'move' }
	]);
});
</script>

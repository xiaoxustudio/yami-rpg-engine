<template>
	<WindowFrame id="shakeScreen" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.shakeScreen.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Shake Mode</div><SelectBox id="shakeScreen-mode" v-model="form.mode" /> <div class="text">Power</div
				><NumberBox id="shakeScreen-power" min="1" max="10" v-model="form.power" /> <div class="text">Speed</div
				><NumberBox id="shakeScreen-speed" min="1" max="10" v-model="form.speed" /> <div class="text">Easing</div
				><SelectBox id="shakeScreen-easingId" name="easing" v-model="form.easingId" /> <div class="text">Duration</div
				><NumberBox
					id="shakeScreen-duration"
					name="duration"
					min="1"
					max="3600000"
					unit="ms"
					v-model="form.duration"
				 />
				<div class="text">Wait</div><SelectBox id="shakeScreen-wait" name="wait" v-model="form.wait" />
			</div>
		
	</WindowFrame>
	
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useShakeScreenCommandSchema } from '@app/composables/commands/useShakeScreenCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { Data } from '@app/legacy/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useShakeScreenCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#shakeScreen-mode')?.loadItems?.([
		{ name: 'Random', value: 'random' },
		{ name: 'Horizontal', value: 'horizontal' },
		{ name: 'Vertical', value: 'vertical' }
	]);
	$('#shakeScreen-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#shakeScreen')?.on?.('open', () => {
		$('#shakeScreen-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	$('#shakeScreen')?.on?.('closed', () => {
		clear($('#shakeScreen-easingId'));
	});
});

</script>

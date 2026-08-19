<template>
	<WindowFrame id="setGameSpeed" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.setGameSpeed.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Speed</div
				><NumberVar
					id="setGameSpeed-speed"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
					v-model="form.speed"
				/>
				<div class="text">Easing</div><SelectBox id="setGameSpeed-easingId" name="easing" v-model="form.easingId" />
				<div class="text">Duration</div
				><NumberVar
					id="setGameSpeed-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
					v-model="form.duration"
				/>
				<div class="text">Wait</div><SelectBox id="setGameSpeed-wait" name="wait" v-model="form.wait" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetGameSpeedCommandSchema } from '@app/composables/commands/useSetGameSpeedCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { clear } from '@app/legacy/util/element-utils';
import { Data } from '@app/legacy/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetGameSpeedCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setGameSpeed-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#setGameSpeed')?.on?.('open', () => {
		$('#setGameSpeed-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	$('#setGameSpeed')?.on?.('closed', () => {
		clear($('#setGameSpeed-easingId'));
	});
});

</script>

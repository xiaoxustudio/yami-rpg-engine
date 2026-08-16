<template>
	<WindowFrame id="moveCamera" @confirm="onConfirm">
		<template #title><TitleBar>Move Camera<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Mode</div><SelectBox id="moveCamera-mode" v-model="form.mode" /> <div class="text">Position</div
				><CustomBox id="moveCamera-position" type="position" @input="onPosition" /> <div class="text">Actor</div
				><CustomBox id="moveCamera-actor" type="actor" @input="onActor" /> <div class="text">Easing</div
				><SelectBox id="moveCamera-easingId" name="easing" v-model="form.easingId" /> <div class="text">Duration</div
				><NumberBox
					id="moveCamera-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
					v-model="form.duration"
				 />
				<div class="text">Wait</div><SelectBox id="moveCamera-wait" name="wait" v-model="form.wait" />
			</div>
		
	</WindowFrame>
	
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useMoveCameraCommandSchema } from '@app/composables/commands/useMoveCameraCommandSchema';
import { $ } from '@/util/dom.ts';
import { Local } from '@/tools/localization.ts';
import { clear } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useMoveCameraCommandSchema();

const onPosition = (value: unknown) => {
	form.position = value;
};

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = Local.createGetter!('command.moveCamera');
	$('#moveCamera-mode')?.loadItems?.([
		{ name: get('position') || 'Move to Position', value: 'position' },
		{ name: get('actor') || 'Follow Actor', value: 'actor' }
	]);
	$('#moveCamera-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'position', targets: [$('#moveCamera-position')] },
			{ case: 'actor', targets: [$('#moveCamera-actor')] }
		]);
	$('#moveCamera-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#moveCamera')?.on?.('open', () => {
		$('#moveCamera-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	$('#moveCamera')?.on?.('closed', () => {
		clear($('#moveCamera-easingId'));
	});
});

</script>

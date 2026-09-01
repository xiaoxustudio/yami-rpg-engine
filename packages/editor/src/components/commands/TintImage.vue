<template>
	<WindowFrame id="tintImage" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.tintImage.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box" id="tintImage-grid-box">
			<div class="text">Element</div>
			<CustomBox id="tintImage-element" v-focus type="element" v-model="form.element" />
			<div class="text">Mode</div>
			<SelectBox id="tintImage-mode" v-model="form.mode" />
			<div class="text">Tint - Red</div>
			<NumberBox
				id="tintImage-tint-0"
				min="-255"
				max="255"
				step="5"
				v-model="form['tint-0']"
			/>
			<div class="text">Tint - Green</div>
			<NumberBox
				id="tintImage-tint-1"
				min="-255"
				max="255"
				step="5"
				v-model="form['tint-1']"
			/>
			<div class="text">Tint - Blue</div>
			<NumberBox
				id="tintImage-tint-2"
				min="-255"
				max="255"
				step="5"
				v-model="form['tint-2']"
			/>
			<div class="text">Tint - Grayscale</div>
			<NumberBox id="tintImage-tint-3" min="0" max="255" step="5" v-model="form['tint-3']" />
			<div class="text">Easing</div>
			<SelectBox id="tintImage-easingId" name="easing" v-model="form.easingId" />
			<div class="text">Duration</div>
			<NumberBox
				id="tintImage-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
			<div class="text">Wait</div>
			<SelectBox id="tintImage-wait" name="wait" v-model="form.wait" />
		</div>
		<FilterBox id="tintImage-filter" width="96" height="208" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTintImageCommandSchema } from '@app/composables/commands/useTintImageCommandSchema';
import { $ } from '@app/utils/dom';
import { clear, write } from '@app/utils/element-utils';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import FilterBox from '@app/components/common/FilterBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useTintImageCommandSchema();

const onConfirm = () => {
	save();
};

watch(
	[
		() => form.mode,
		() => form['tint-0'],
		() => form['tint-1'],
		() => form['tint-2'],
		() => form['tint-3']
	],
	([mode, red, green, blue, gray]) => {
		let tint;
		switch (mode) {
			case 'full':
				tint = [red, green, blue, gray];
				break;
			case 'rgb':
				tint = [red, green, blue];
				break;
			case 'gray':
				tint = [gray];
				break;
		}
		write($('#tintImage-filter'), tint);
	}
);

onMounted(() => {
	$('#tintImage-mode')?.loadItems?.([
		{ name: t('command.tintImage.full') || 'Full', value: 'full' },
		{ name: t('command.tintImage.rgb') || 'RGB', value: 'rgb' },
		{ name: t('command.tintImage.gray') || 'Gray', value: 'gray' }
	]);
	$('#tintImage-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'full',
				targets: [
					$('#tintImage-tint-0'),
					$('#tintImage-tint-1'),
					$('#tintImage-tint-2'),
					$('#tintImage-tint-3')
				]
			},
			{
				case: 'rgb',
				targets: [$('#tintImage-tint-0'), $('#tintImage-tint-1'), $('#tintImage-tint-2')]
			},
			{ case: 'gray', targets: [$('#tintImage-tint-3')] }
		]);
	$('#tintImage-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#tintImage')?.on?.('open', () => {
		$('#tintImage-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	$('#tintImage')?.on?.('closed', () => {
		clear($('#tintImage-easingId'));
		clear($('#tintImage-filter'));
	});
});
</script>

<template>
	<WindowFrame id="tintImage" :ref="registryRef(fieldEls, 'tintImage')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.tintImage.title') }}
				<div class="close" /></TitleBar
		></template>

		<div
			class="grid-box"
			id="tintImage-grid-box"
			:ref="registryRef(fieldEls, 'tintImage-grid-box')"
		>
			<div class="text">{{ t('components.tintImage-element.label') }}</div>
			<CustomBox
				id="tintImage-element"
				:ref="registryRef(fieldEls, 'tintImage-element')"
				v-tip="t('components.tintImage-element.tip')"
				v-focus
				type="element"
				v-model="form.element"
			/>
			<div class="text">{{ t('components.tintImage-mode.label') }}</div>
			<SelectBox
				id="tintImage-mode"
				v-tip="t('components.tintImage-mode.tip')"
				:ref="registryRef(fieldEls, 'tintImage-mode')"
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.tintImage-tint-0.label') }}</div>
			<NumberBox
				:label="t('components.tintImage-tint-0.label')"
				id="tintImage-tint-0"
				v-tip="t('components.tintImage-tint-0.tip')"
				:ref="registryRef(fieldEls, 'tintImage-tint-0')"
				min="-255"
				max="255"
				step="5"
				v-model="tint0"
			/>
			<div class="text">{{ t('components.tintImage-tint-1.label') }}</div>
			<NumberBox
				:label="t('components.tintImage-tint-1.label')"
				id="tintImage-tint-1"
				v-tip="t('components.tintImage-tint-1.tip')"
				:ref="registryRef(fieldEls, 'tintImage-tint-1')"
				min="-255"
				max="255"
				step="5"
				v-model="tint1"
			/>
			<div class="text">{{ t('components.tintImage-tint-2.label') }}</div>
			<NumberBox
				:label="t('components.tintImage-tint-2.label')"
				id="tintImage-tint-2"
				v-tip="t('components.tintImage-tint-2.tip')"
				:ref="registryRef(fieldEls, 'tintImage-tint-2')"
				min="-255"
				max="255"
				step="5"
				v-model="tint2"
			/>
			<div class="text">{{ t('components.tintImage-tint-3.label') }}</div>
			<NumberBox
				:label="t('components.tintImage-tint-3.label')"
				id="tintImage-tint-3"
				v-tip="t('components.tintImage-tint-3.tip')"
				:ref="registryRef(fieldEls, 'tintImage-tint-3')"
				min="0"
				max="255"
				step="5"
				v-model="tint3"
			/>
			<div class="text">{{ t('components.tintImage-easingId.label') }}</div>
			<SelectBox
				id="tintImage-easingId"
				:ref="registryRef(fieldEls, 'tintImage-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.tintImage-duration.label') }}</div>
			<NumberBox
				:label="t('components.tintImage-duration.label')"
				id="tintImage-duration"
				:ref="registryRef(fieldEls, 'tintImage-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">{{ t('components.tintImage-wait.label') }}</div>
			<SelectBox
				id="tintImage-wait"
				:ref="registryRef(fieldEls, 'tintImage-wait')"
				name="wait"
				v-model="form.wait"
			/>
		</div>
		<FilterBox
			id="tintImage-filter"
			:ref="registryRef(fieldEls, 'tintImage-filter')"
			width="96"
			height="208"
		/>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTintImageCommandSchema } from '@app/composables/commands/useTintImageCommandSchema';
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

const tint0 = computed({
	get: () => form['tint-0'] as number | string,
	set: (value) => {
		form['tint-0'] = value;
	}
});

const tint1 = computed({
	get: () => form['tint-1'] as number | string,
	set: (value) => {
		form['tint-1'] = value;
	}
});

const tint2 = computed({
	get: () => form['tint-2'] as number | string,
	set: (value) => {
		form['tint-2'] = value;
	}
});

const tint3 = computed({
	get: () => form['tint-3'] as number | string,
	set: (value) => {
		form['tint-3'] = value;
	}
});

const duration = computed({
	get: () => form.duration as number | string,
	set: (value) => {
		form.duration = value;
	}
});

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
		write(fieldEls.get('tintImage-filter'), tint);
	}
);

onMounted(() => {
	useLocalizedOptions(
		'tintImage-mode',
		['full', 'rgb', 'gray'],
		(items) => fieldEls.get('tintImage-mode')?.loadItems?.(items),
		{
			full: 'command.tintImage.full',
			rgb: 'command.tintImage.rgb',
			gray: 'command.tintImage.gray'
		}
	);
	fieldEls
		.get('tintImage-mode')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'full',
				targets: [
					fieldEls.get('tintImage-tint-0'),
					fieldEls.get('tintImage-tint-1'),
					fieldEls.get('tintImage-tint-2'),
					fieldEls.get('tintImage-tint-3')
				]
			},
			{
				case: 'rgb',
				targets: [
					fieldEls.get('tintImage-tint-0'),
					fieldEls.get('tintImage-tint-1'),
					fieldEls.get('tintImage-tint-2')
				]
			},
			{ case: 'gray', targets: [fieldEls.get('tintImage-tint-3')] }
		]);
	useLocalizedOptions('tintImage-wait', [true, false], (items) =>
		fieldEls.get('tintImage-wait')?.loadItems?.(items)
	);
	fieldEls.get('tintImage')?.on?.('open', () => {
		fieldEls.get('tintImage-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	fieldEls.get('tintImage')?.on?.('closed', () => {
		clear(fieldEls.get('tintImage-filter'));
	});
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#tintImage {
	width: 428px;
	height: 290px;
}

#tintImage-grid-box {
	width: 304px;
}

#tintImage-filter {
	position: absolute;
	left: 318px;
	top: 10px;
	width: 100px;
	height: 212px;
}

#tintImage-confirm {
	right: 108px;
	bottom: 10px;
}

#tintImage-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

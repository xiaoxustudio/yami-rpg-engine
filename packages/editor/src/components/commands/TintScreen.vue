<template>
	<WindowFrame id="tintScreen" :ref="registryRef(fieldEls, 'tintScreen')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.tintScreen.title') }}
				<div class="close" /></TitleBar
		></template>

		<div
			class="grid-box"
			id="tintScreen-grid-box"
			:ref="registryRef(fieldEls, 'tintScreen-grid-box')"
		>
			<div class="text">{{ t('components.tintScreen-tint-0.label') }}</div>
			<NumberBox
				id="tintScreen-tint-0"
				:ref="registryRef(fieldEls, 'tintScreen-tint-0')"
				v-tip="t('components.tintScreen-tint-0.tip')"
				v-focus
				min="-255"
				max="255"
				step="5"
				v-model="tint0"
			/>
			<div class="text">{{ t('components.tintScreen-tint-1.label') }}</div>
			<NumberBox
				id="tintScreen-tint-1"
				:ref="registryRef(fieldEls, 'tintScreen-tint-1')"
				v-tip="t('components.tintScreen-tint-1.tip')"
				min="-255"
				max="255"
				step="5"
				v-model="tint1"
			/>
			<div class="text">{{ t('components.tintScreen-tint-2.label') }}</div>
			<NumberBox
				id="tintScreen-tint-2"
				:ref="registryRef(fieldEls, 'tintScreen-tint-2')"
				v-tip="t('components.tintScreen-tint-2.tip')"
				min="-255"
				max="255"
				step="5"
				v-model="tint2"
			/>
			<div class="text">{{ t('components.tintScreen-tint-3.label') }}</div>
			<NumberBox
				id="tintScreen-tint-3"
				:ref="registryRef(fieldEls, 'tintScreen-tint-3')"
				v-tip="t('components.tintScreen-tint-3.tip')"
				min="0"
				max="255"
				step="5"
				v-model="tint3"
			/>
			<div class="text">{{ t('components.tintScreen-easingId.label') }}</div>
			<SelectBox
				id="tintScreen-easingId"
				:ref="registryRef(fieldEls, 'tintScreen-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.tintScreen-duration.label') }}</div>
			<NumberBox
				id="tintScreen-duration"
				:ref="registryRef(fieldEls, 'tintScreen-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">{{ t('components.tintScreen-wait.label') }}</div>
			<SelectBox
				id="tintScreen-wait"
				:ref="registryRef(fieldEls, 'tintScreen-wait')"
				name="wait"
				v-model="form.wait"
			/>
		</div>
		<FilterBox
			id="tintScreen-filter"
			:ref="registryRef(fieldEls, 'tintScreen-filter')"
			width="96"
			height="160"
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
import { useTintScreenCommandSchema } from '@app/composables/commands/useTintScreenCommandSchema';
import { clear, write } from '@app/utils/element-utils';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import FilterBox from '@app/components/common/FilterBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useTintScreenCommandSchema();

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
	[() => form['tint-0'], () => form['tint-1'], () => form['tint-2'], () => form['tint-3']],
	([red, green, blue, gray]) => {
		write(fieldEls.get('tintScreen-filter'), [red, green, blue, gray]);
	}
);

onMounted(() => {
	useLocalizedOptions('tintScreen-wait', [true, false], (items) =>
		fieldEls.get('tintScreen-wait')?.loadItems?.(items)
	);
	fieldEls.get('tintScreen')?.on?.('open', () => {
		fieldEls.get('tintScreen-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	fieldEls.get('tintScreen')?.on?.('closed', () => {
		clear(fieldEls.get('tintScreen-filter'));
	});
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#tintScreen {
	width: 428px;
	height: 242px;
}

#tintScreen-grid-box {
	width: 304px;
}

#tintScreen-filter {
	position: absolute;
	left: 318px;
	top: 10px;
	width: 100px;
	height: 164px;
}

#tintScreen-confirm {
	right: 108px;
	bottom: 10px;
}

#tintScreen-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

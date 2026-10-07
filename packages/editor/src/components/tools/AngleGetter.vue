<template>
	<WindowFrame ref="frame" id="angleGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.angleGetter.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.angleGetter-type.label') }}</div>
			<SelectBox
				:label="t('components.angleGetter-type.label')"
				id="angleGetter-type"
				v-tip="t('components.angleGetter-type.tip')"
				:ref="fieldRef('angleGetter-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.angleGetter-position-position.label') }}</div>
			<CustomBox
				id="angleGetter-position-position"
				v-tip="t('components.angleGetter-position-position.tip')"
				:ref="fieldRef('angleGetter-position-position')"
				type="position"
				v-model="form.position"
			/>
			<div class="text">{{ t('components.angleGetter-common-degrees.label') }}</div>
			<NumberVar
				id="angleGetter-common-degrees"
				v-tip="t('components.angleGetter-common-degrees.tip')"
				:ref="fieldRef('angleGetter-common-degrees')"
				min="-36000"
				max="36000"
				decimals="4"
				unit="deg"
				v-model="form.degrees"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { AngleGetter } from '@app/commands/accessors/angle-accessor-window.ts';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';
import { useAngleGetterWindow } from '@app/composables/useAngleGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const angleGetter = useAngleGetterWindow();
const form = angleGetter.form;

const { fields, fieldRef } = createAccessorFields();
AngleGetter.fields = fields;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	AngleGetter?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => angleGetter.onWindowClosed());
	}
});
</script>

<style>
#angleGetter {
	width: 324px;
	height: 122px;
}

#angleGetter-confirm {
	right: 108px;
	bottom: 10px;
}

#angleGetter-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

<template>
	<WindowFrame id="setAnimation-property" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setAnimation-property.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setAnimation-property-key.label') }}</div>
			<SelectBox
				:label="t('components.setAnimation-property-key.label')"
				id="setAnimation-property-key"
				v-tip="t('components.setAnimation-property-key.tip')"
				:ref="fieldRef('setAnimation-property-key')"
				v-model="form.key"
			/>
			<div class="text">{{ t('components.setAnimation-property-animation.label') }}</div>
			<CustomBox
				id="setAnimation-property-animation"
				:ref="fieldRef('setAnimation-property-animation')"
				type="file"
				filter="animation"
				v-model="form.animation"
			/>
			<div class="text">{{ t('components.setAnimation-property-actor.label') }}</div>
			<CustomBox
				id="setAnimation-property-actor"
				:ref="fieldRef('setAnimation-property-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.setAnimation-property-motion.label') }}</div>
			<CustomBox
				id="setAnimation-property-motion"
				:ref="fieldRef('setAnimation-property-motion')"
				type="enum-string"
				v-model="form.motion"
			/>
			<div class="text">{{ t('components.setAnimation-property-angle.label') }}</div>
			<NumberVar
				id="setAnimation-property-angle"
				:ref="fieldRef('setAnimation-property-angle')"
				min="0"
				max="360"
				unit="deg"
				v-model="form.angle"
			/>
			<div class="text">{{ t('components.setAnimation-property-frame.label') }}</div>
			<NumberVar
				id="setAnimation-property-frame"
				:ref="fieldRef('setAnimation-property-frame')"
				min="0"
				max="10000"
				v-model="form.frame"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { AnimationProperty } from '@app/commands/property-window/set-animation-property-window';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';

const { t } = useI18n();

const form = AnimationProperty.form;

const onConfirm = () => {
	AnimationProperty.confirm?.(new Event('click'));
};

const { fields, fieldRef } = createAccessorFields();
AnimationProperty.fields = fields;

onMounted(() => {
	AnimationProperty.ensureSetup?.();
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#setAnimation-property {
	width: 324px;
	height: 122px;
}

#setAnimation-property-content {
	height: 92px;
}

#setAnimation-property-confirm {
	right: 108px;
	bottom: 10px;
}

#setAnimation-property-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

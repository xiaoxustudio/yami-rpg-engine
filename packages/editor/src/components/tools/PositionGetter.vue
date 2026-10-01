<template>
	<WindowFrame ref="frame" id="positionGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.positionGetter.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.positionGetter-type.label') }}</div>
			<SelectBox
				:label="t('components.positionGetter-type.label')"
				id="positionGetter-type"
				v-tip="t('components.positionGetter-type.tip')"
				:ref="fieldRef('positionGetter-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.positionGetter-common-x.label') }}</div>
			<NumberVar
				id="positionGetter-common-x"
				v-tip="t('components.positionGetter-common-x.tip')"
				:ref="fieldRef('positionGetter-common-x')"
				min="-512"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.x"
			/>
			<div class="text">{{ t('components.positionGetter-common-y.label') }}</div>
			<NumberVar
				id="positionGetter-common-y"
				v-tip="t('components.positionGetter-common-y.tip')"
				:ref="fieldRef('positionGetter-common-y')"
				min="-512"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.y"
			/>
			<div class="text">{{ t('components.positionGetter-actor.label') }}</div>
			<CustomBox
				id="positionGetter-actor"
				v-tip="t('components.positionGetter-actor.tip')"
				:ref="fieldRef('positionGetter-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.positionGetter-trigger.label') }}</div>
			<CustomBox
				id="positionGetter-trigger"
				v-tip="t('components.positionGetter-trigger.tip')"
				:ref="fieldRef('positionGetter-trigger')"
				type="trigger"
				v-model="form.trigger"
			/>
			<div class="text">{{ t('components.positionGetter-light.label') }}</div>
			<CustomBox
				id="positionGetter-light"
				v-tip="t('components.positionGetter-light.tip')"
				:ref="fieldRef('positionGetter-light')"
				type="light"
				v-model="form.light"
			/>
			<div class="text">{{ t('components.positionGetter-region.label') }}</div>
			<CustomBox
				id="positionGetter-region"
				v-tip="t('components.positionGetter-region.tip')"
				:ref="fieldRef('positionGetter-region')"
				type="region"
				v-model="form.region"
			/>
			<div class="text">{{ t('components.positionGetter-region-mode.label') }}</div>
			<SelectBox
				:label="t('components.positionGetter-region-mode.label')"
				id="positionGetter-region-mode"
				v-tip="t('components.positionGetter-region-mode.tip')"
				:ref="fieldRef('positionGetter-region-mode')"
				v-model="form.mode"
			/>
			<div class="text">{{ t('components.positionGetter-objectId.label') }}</div>
			<CustomBox
				id="positionGetter-objectId"
				v-tip="t('components.positionGetter-objectId.tip')"
				:ref="fieldRef('positionGetter-objectId')"
				v-focus
				type="preset-object"
				filter="any"
				v-model="form.objectId"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { PositionGetter } from '@app/commands/accessors/position-accessor-window.ts';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';
import { usePositionGetterWindow } from '@app/composables/usePositionGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const positionGetter = usePositionGetterWindow();
const form = positionGetter.form;

// 把控件实例登记给访问器模块的 initialize()（替代按 id 查 DOM）
const { fields, fieldRef } = createAccessorFields();
PositionGetter.fields = fields;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	PositionGetter?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => positionGetter.onWindowClosed());
	}
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#positionGetter {
	width: 324px;
	height: 146px;
}

#positionGetter-absolute-x,
#positionGetter-absolute-y,
#positionGetter-relative-x,
#positionGetter-relative-y {
	width: 86px;
}

#positionGetter-confirm {
	right: 108px;
	bottom: 10px;
}

#positionGetter-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

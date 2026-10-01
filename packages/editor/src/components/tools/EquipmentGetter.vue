<template>
	<WindowFrame ref="frame" id="equipmentGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.equipmentGetter.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.equipmentGetter-type.label') }}</div>
			<SelectBox
				:label="t('components.equipmentGetter-type.label')"
				id="equipmentGetter-type"
				v-tip="t('components.equipmentGetter-type.tip')"
				:ref="fieldRef('equipmentGetter-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.equipmentGetter-actor.label') }}</div>
			<CustomBox
				id="equipmentGetter-actor"
				v-tip="t('components.equipmentGetter-actor.tip')"
				:ref="fieldRef('equipmentGetter-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.equipmentGetter-slot.label') }}</div>
			<SelectVar
				id="equipmentGetter-slot"
				v-tip="t('components.equipmentGetter-slot.tip')"
				:ref="fieldRef('equipmentGetter-slot')"
				v-focus
				v-model="form.slot"
			/>
			<div class="text">{{ t('components.equipmentGetter-equipmentId.label') }}</div>
			<CustomBox
				id="equipmentGetter-equipmentId"
				v-tip="t('components.equipmentGetter-equipmentId.tip')"
				:ref="fieldRef('equipmentGetter-equipmentId')"
				v-focus
				type="file"
				filter="equipment"
				v-model="form.equipmentId"
			/>
			<div class="text">{{ t('components.equipmentGetter-variable.label') }}</div>
			<CustomBox
				id="equipmentGetter-variable"
				v-tip="t('components.equipmentGetter-variable.tip')"
				:ref="fieldRef('equipmentGetter-variable')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { EquipmentGetter } from '@app/commands/accessors/equipment-accessor-window.ts';
import { createAccessorFields } from '@app/commands/accessors/accessor-factory.ts';
import { useEquipmentGetterWindow } from '@app/composables/useEquipmentGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const equipmentGetter = useEquipmentGetterWindow();
const form = equipmentGetter.form;

// 把控件实例登记给访问器模块的 initialize()（替代按 id 查 DOM）
const { fields, fieldRef } = createAccessorFields();
EquipmentGetter.fields = fields;

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	EquipmentGetter?.confirm?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => equipmentGetter.onWindowClosed());
	}
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#equipmentGetter {
	width: 324px;
	height: 146px;
}

#equipmentGetter-confirm {
	right: 108px;
	bottom: 10px;
}

#equipmentGetter-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

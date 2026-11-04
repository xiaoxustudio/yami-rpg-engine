<template>
	<WindowFrame id="return" :ref="controlRef('return')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.return.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.return-type.label') }}</div>
			<SelectBox
				:label="t('components.return-type.label')"
				id="return-type"
				v-tip="t('components.return-type.tip')"
				:ref="controlRef('return-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.return-boolean.label') }}</div>
			<SelectBox
				:label="t('components.return-boolean.label')"
				id="return-boolean"
				v-tip="t('components.return-boolean.tip')"
				:ref="controlRef('return-boolean')"
				v-model="form.boolean"
			/>
			<div class="text">{{ t('components.return-number.label') }}</div>
			<NumberVar
				id="return-number"
				v-tip="t('components.return-number.tip')"
				:ref="controlRef('return-number')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.number"
			/>
			<div class="text">{{ t('components.return-string.label') }}</div>
			<StringVar
				id="return-string"
				v-tip="t('components.return-string.tip')"
				:ref="controlRef('return-string')"
				v-model="form.string"
			/>
			<div class="text">{{ t('components.return-object.label') }}</div>
			<CustomBox
				id="return-object"
				v-tip="t('components.return-object.tip')"
				:ref="controlRef('return-object')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.object"
			/>
			<div class="text">{{ t('components.return-actor.label') }}</div>
			<CustomBox
				id="return-actor"
				v-tip="t('components.return-actor.tip')"
				:ref="controlRef('return-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.return-skill.label') }}</div>
			<CustomBox
				id="return-skill"
				v-tip="t('components.return-skill.tip')"
				:ref="controlRef('return-skill')"
				type="skill"
				v-model="form.skill"
			/>
			<div class="text">{{ t('components.return-state.label') }}</div>
			<CustomBox
				id="return-state"
				v-tip="t('components.return-state.tip')"
				:ref="controlRef('return-state')"
				type="state"
				v-model="form.state"
			/>
			<div class="text">{{ t('components.return-equipment.label') }}</div>
			<CustomBox
				id="return-equipment"
				v-tip="t('components.return-equipment.tip')"
				:ref="controlRef('return-equipment')"
				type="equipment"
				v-model="form.equipment"
			/>
			<div class="text">{{ t('components.return-item.label') }}</div>
			<CustomBox
				id="return-item"
				v-tip="t('components.return-item.tip')"
				:ref="controlRef('return-item')"
				type="item"
				v-model="form.item"
			/>
			<div class="text">{{ t('components.return-trigger.label') }}</div>
			<CustomBox
				id="return-trigger"
				v-tip="t('components.return-trigger.tip')"
				:ref="controlRef('return-trigger')"
				type="trigger"
				v-model="form.trigger"
			/>
			<div class="text">{{ t('components.return-light.label') }}</div>
			<CustomBox
				id="return-light"
				v-tip="t('components.return-light.tip')"
				:ref="controlRef('return-light')"
				type="light"
				v-model="form.light"
			/>
			<div class="text">{{ t('components.return-element.label') }}</div>
			<CustomBox
				id="return-element"
				v-tip="t('components.return-element.tip')"
				:ref="controlRef('return-element')"
				type="element"
				v-model="form.element"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
/** 仍有全局消费方的那个控件（schema 要给它 loadItems），继续镜像进全局注册表。 */

/** 其余控件只存在本窗口的局部表里（模板 ref 回调写入，见 boxRef）。 */
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReturnCommandSchema } from '@app/composables/commands/useReturnCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';
import {
	provideReturnBridge,
	resetReturnBridge,
	type ReturnBridge
} from '@app/composables/return-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'return-actor'
	| 'return-boolean'
	| 'return-element'
	| 'return-equipment'
	| 'return-item'
	| 'return-light'
	| 'return-number'
	| 'return-object'
	| 'return-skill'
	| 'return-state'
	| 'return-string'
	| 'return-trigger'
	| 'return-type'
	| 'return';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useReturnCommandSchema();

const onConfirm = () => {
	save();
};

/** 控件级能力：schema 载入/保存要用，但 schema 不该知道控件 id。 */
const bridgeApi: ReturnBridge = {
	loadTypeItems: (items) => {
		controls['return-type']?.loadItems?.(items);
	}
};

onMounted(() => {
	provideReturnBridge(bridgeApi);
	onUnmounted(() => resetReturnBridge(bridgeApi));
	controls['return-boolean']?.loadItems?.([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	]);
	controls['return-type']?.enableHiddenMode?.();
	controls['return-type']?.relate?.([
		{ case: 'boolean', targets: [controlRoot(controls['return-boolean'])] },
		{ case: 'number', targets: [controlRoot(controls['return-number'])] },
		{ case: 'string', targets: [controlRoot(controls['return-string'])] },
		{ case: 'object', targets: [controlRoot(controls['return-object'])] },
		{ case: 'actor', targets: [controlRoot(controls['return-actor'])] },
		{ case: 'skill', targets: [controlRoot(controls['return-skill'])] },
		{ case: 'state', targets: [controlRoot(controls['return-state'])] },
		{ case: 'equipment', targets: [controlRoot(controls['return-equipment'])] },
		{ case: 'item', targets: [controlRoot(controls['return-item'])] },
		{ case: 'trigger', targets: [controlRoot(controls['return-trigger'])] },
		{ case: 'light', targets: [controlRoot(controls['return-light'])] },
		{ case: 'element', targets: [controlRoot(controls['return-element'])] }
	]);
});
</script>

<style>
#return {
	width: 324px;
	height: 122px;
}

#return-confirm {
	right: 108px;
	bottom: 10px;
}

#return-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

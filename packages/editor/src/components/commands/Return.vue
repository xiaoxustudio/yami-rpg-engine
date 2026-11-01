<template>
	<WindowFrame id="return" :ref="boxRef('return')" @confirm="onConfirm">
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
				:ref="registryRef(fieldEls, 'return-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.return-boolean.label') }}</div>
			<SelectBox
				:label="t('components.return-boolean.label')"
				id="return-boolean"
				v-tip="t('components.return-boolean.tip')"
				:ref="boxRef('return-boolean')"
				v-model="form.boolean"
			/>
			<div class="text">{{ t('components.return-number.label') }}</div>
			<NumberVar
				id="return-number"
				v-tip="t('components.return-number.tip')"
				:ref="boxRef('return-number')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.number"
			/>
			<div class="text">{{ t('components.return-string.label') }}</div>
			<StringVar
				id="return-string"
				v-tip="t('components.return-string.tip')"
				:ref="boxRef('return-string')"
				v-model="form.string"
			/>
			<div class="text">{{ t('components.return-object.label') }}</div>
			<CustomBox
				id="return-object"
				v-tip="t('components.return-object.tip')"
				:ref="boxRef('return-object')"
				v-focus
				type="variable"
				filter="object"
				v-model="form.object"
			/>
			<div class="text">{{ t('components.return-actor.label') }}</div>
			<CustomBox
				id="return-actor"
				v-tip="t('components.return-actor.tip')"
				:ref="boxRef('return-actor')"
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.return-skill.label') }}</div>
			<CustomBox
				id="return-skill"
				v-tip="t('components.return-skill.tip')"
				:ref="boxRef('return-skill')"
				type="skill"
				v-model="form.skill"
			/>
			<div class="text">{{ t('components.return-state.label') }}</div>
			<CustomBox
				id="return-state"
				v-tip="t('components.return-state.tip')"
				:ref="boxRef('return-state')"
				type="state"
				v-model="form.state"
			/>
			<div class="text">{{ t('components.return-equipment.label') }}</div>
			<CustomBox
				id="return-equipment"
				v-tip="t('components.return-equipment.tip')"
				:ref="boxRef('return-equipment')"
				type="equipment"
				v-model="form.equipment"
			/>
			<div class="text">{{ t('components.return-item.label') }}</div>
			<CustomBox
				id="return-item"
				v-tip="t('components.return-item.tip')"
				:ref="boxRef('return-item')"
				type="item"
				v-model="form.item"
			/>
			<div class="text">{{ t('components.return-trigger.label') }}</div>
			<CustomBox
				id="return-trigger"
				v-tip="t('components.return-trigger.tip')"
				:ref="boxRef('return-trigger')"
				type="trigger"
				v-model="form.trigger"
			/>
			<div class="text">{{ t('components.return-light.label') }}</div>
			<CustomBox
				id="return-light"
				v-tip="t('components.return-light.tip')"
				:ref="boxRef('return-light')"
				type="light"
				v-model="form.light"
			/>
			<div class="text">{{ t('components.return-element.label') }}</div>
			<CustomBox
				id="return-element"
				v-tip="t('components.return-element.tip')"
				:ref="boxRef('return-element')"
				type="element"
				v-model="form.element"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

/** 仍有全局消费方的那个控件（schema 要给它 loadItems），继续镜像进全局注册表。 */
const fieldEls = createElementRegistry(composableEls);

/** 其余控件只存在本窗口的局部表里（模板 ref 回调写入，见 boxRef）。 */
type ControlElement = HTMLElement & {
	loadItems?: (items: unknown[]) => unknown;
	write?: (value: unknown) => void;
	read?: () => unknown;
};
const boxes: Record<string, ControlElement | null> = {};
const boxRef = (id: string) => (el: unknown) => {
	if (el == null) {
		boxes[id] = null;
		return;
	}
	if (el instanceof HTMLElement) {
		boxes[id] = el as ControlElement;
		return;
	}
	const instance = el as { $el?: unknown; root?: unknown };
	const root = instance.$el ?? instance.root ?? null;
	boxes[id] = root instanceof HTMLElement ? (root as ControlElement) : null;
};
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReturnCommandSchema } from '@app/composables/commands/useReturnCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useReturnCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	boxes['return-boolean']?.loadItems?.([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	]);
	fieldEls
		.get('return-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'boolean', targets: [boxes['return-boolean']] },
			{ case: 'number', targets: [boxes['return-number']] },
			{ case: 'string', targets: [boxes['return-string']] },
			{ case: 'object', targets: [boxes['return-object']] },
			{ case: 'actor', targets: [boxes['return-actor']] },
			{ case: 'skill', targets: [boxes['return-skill']] },
			{ case: 'state', targets: [boxes['return-state']] },
			{ case: 'equipment', targets: [boxes['return-equipment']] },
			{ case: 'item', targets: [boxes['return-item']] },
			{ case: 'trigger', targets: [boxes['return-trigger']] },
			{ case: 'light', targets: [boxes['return-light']] },
			{ case: 'element', targets: [boxes['return-element']] }
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

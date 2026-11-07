<template>
	<WindowFrame id="switch-condition" :ref="bind('root')" scrollable @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.switch-condition.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.switch-condition-type.label') }}</div>
			<SelectBox
				:label="t('components.switch-condition-type.label')"
				id="switch-condition-type"
				v-tip="t('components.switch-condition-type.tip')"
				:ref="bind('type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.switch-condition-boolean-value.label') }}</div>
			<SelectBox
				:label="t('components.switch-condition-boolean-value.label')"
				id="switch-condition-boolean-value"
				v-tip="t('components.switch-condition-boolean-value.tip')"
				:ref="bind('boolean')"
				v-model="form.booleanValue"
			/>
			<div class="text">{{ t('components.switch-condition-number-value.label') }}</div>
			<NumberBox
				:label="t('components.switch-condition-number-value.label')"
				id="switch-condition-number-value"
				v-tip="t('components.switch-condition-number-value.tip')"
				:ref="bind('number')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.numberValue"
			/>
			<div class="text">{{ t('components.switch-condition-string-value.label') }}</div>
			<TextArea
				:label="t('components.switch-condition-string-value.label')"
				id="switch-condition-string-value"
				v-tip="t('components.switch-condition-string-value.tip')"
				:ref="bind('string')"
				v-model="form.stringValue"
			/>
			<div class="text">
				{{ t('components.switch-condition-attribute-attributeId.label') }}
			</div>
			<CustomBox
				id="switch-condition-attribute-attributeId"
				v-tip="t('components.switch-condition-attribute-attributeId.tip')"
				:ref="bind('attribute')"
				v-focus
				type="attribute"
				v-model="form.attributeId"
			/>
			<div class="text">{{ t('components.switch-condition-enum-stringId.label') }}</div>
			<CustomBox
				id="switch-condition-enum-stringId"
				v-tip="t('components.switch-condition-enum-stringId.tip')"
				:ref="bind('enum')"
				v-focus
				type="enum-string"
				v-model="form.stringId"
			/>
			<div class="text">{{ t('components.switch-condition-keyboard-keycode.label') }}</div>
			<KeyboardBox
				:label="t('components.switch-condition-keyboard-keycode.label')"
				id="switch-condition-keyboard-keycode"
				v-tip="t('components.switch-condition-keyboard-keycode.tip')"
				:ref="bind('keyboard')"
				v-focus
			/>
			<div class="text">{{ t('components.switch-condition-gamepad-button.label') }}</div>
			<GamepadBox
				:label="t('components.switch-condition-gamepad-button.label')"
				id="switch-condition-gamepad-button"
				v-tip="t('components.switch-condition-gamepad-button.tip')"
				:ref="bind('gamepad')"
				v-focus
			/>
			<div class="text">{{ t('components.switch-condition-mouse-button.label') }}</div>
			<SelectBox
				:label="t('components.switch-condition-mouse-button.label')"
				id="switch-condition-mouse-button"
				v-tip="t('components.switch-condition-mouse-button.tip')"
				:ref="bind('mouse')"
				v-model="form.mouseButton"
			/>
			<div class="text">{{ t('components.switch-condition-variable-variable.label') }}</div>
			<CustomBox
				id="switch-condition-variable-variable"
				v-tip="t('components.switch-condition-variable-variable.tip')"
				:ref="bind('variable')"
				v-focus
				type="variable"
				filter="all"
				v-model="form.variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import {
	provideSwitchCondition,
	resetSwitchCondition,
	type SwitchConditionApi
} from '@app/composables/switch-condition-bridge';
import { controlRoot, toControl, type ControlApi } from '@app/composables/control-refs';
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSwitchConditionSchema } from '@app/composables/useSwitchConditionSchema';

const SwitchCondition = useSwitchConditionSchema();
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import GamepadBox from '@app/components/common/GamepadBox.vue';
import KeyboardBox from '@app/components/common/KeyboardBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { form } from '@app/composables/useSwitchConditionSchema';
import type { YamiElement } from '@app/types/element-api';

const { t } = useI18n();

/** 窗口内控件表：模板用 bind(key) 填，脚本按 key 取。 */
const controls: Partial<Record<string, ControlApi | null>> = {};
const bind = (key: string) => (target: unknown) => {
	controls[key] = toControl(target);
};
const of = (key: string): ControlApi | null => controls[key] ?? null;

const onConfirm = () => {
	SwitchCondition?.confirm?.(new Event('click'));
};

const bridgeApi: SwitchConditionApi = {
	control: (name) => (name === 'keyboard' ? of('keyboard') : of('gamepad'))
};

onMounted(() => {
	provideSwitchCondition(bridgeApi);
	onUnmounted(() => resetSwitchCondition(bridgeApi));
	const typeEl = of('type') as unknown as YamiElement;
	if (!typeEl) return;
	typeEl.loadItems([
		{ name: 'None', value: 'none' },
		{ name: 'Boolean', value: 'boolean' },
		{ name: 'Number', value: 'number' },
		{ name: 'String', value: 'string' },
		{ name: 'Attribute Key', value: 'attribute' },
		{ name: 'Enum String', value: 'enum' },
		{ name: 'Keyboard', value: 'keyboard' },
		{ name: 'Gamepad', value: 'gamepad' },
		{ name: 'Mouse', value: 'mouse' },
		{ name: 'Variable', value: 'variable' }
	]);

	typeEl.enableHiddenMode?.()?.relate?.([
		{
			case: 'boolean',
			targets: [controlRoot(of('boolean'))]
		},
		{ case: 'number', targets: [controlRoot(of('number'))] },
		{ case: 'string', targets: [controlRoot(of('string'))] },
		{
			case: 'attribute',
			targets: [controlRoot(of('attribute'))]
		},
		{ case: 'enum', targets: [controlRoot(of('enum'))] },
		{
			case: 'keyboard',
			targets: [controlRoot(of('keyboard'))]
		},
		{
			case: 'gamepad',
			targets: [controlRoot(of('gamepad'))]
		},
		{ case: 'mouse', targets: [controlRoot(of('mouse'))] },
		{
			case: 'variable',
			targets: [controlRoot(of('variable'))]
		}
	]);

	of('boolean')?.loadItems?.([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	]);

	useLocalizedOptions('switch-condition-mouse-button', [0, 1, 2, 3, 4], (items) =>
		of('mouse')?.loadItems?.(items)
	);
});
</script>

<style>
#switch-condition {
	width: 324px;
	height: 146px;
}

#switch-condition-string-value {
	height: 44px;
}

#switch-condition-confirm {
	right: 108px;
	bottom: 10px;
}

#switch-condition-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

<template>
	<!-- 匹配 - 条件 -->
	<WindowFrame id="switch-condition" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.switch-condition.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.switch-condition-type.label') }}</div>
			<SelectBox id="switch-condition-type" v-focus v-model="form.type" />
			<div class="text">{{ t('components.switch-condition-boolean-value.label') }}</div>
			<SelectBox id="switch-condition-boolean-value" v-model="form.booleanValue" />
			<div class="text">{{ t('components.switch-condition-number-value.label') }}</div>
			<NumberBox
				id="switch-condition-number-value"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.numberValue"
			/>
			<div class="text">{{ t('components.switch-condition-string-value.label') }}</div>
			<TextArea id="switch-condition-string-value" v-model="form.stringValue" />
			<div class="text">
				{{ t('components.switch-condition-attribute-attributeId.label') }}
			</div>
			<CustomBox
				id="switch-condition-attribute-attributeId"
				v-focus
				type="attribute"
				v-model="form.attributeId"
			/>
			<div class="text">{{ t('components.switch-condition-enum-stringId.label') }}</div>
			<CustomBox
				id="switch-condition-enum-stringId"
				v-focus
				type="enum-string"
				v-model="form.stringId"
			/>
			<div class="text">{{ t('components.switch-condition-keyboard-keycode.label') }}</div>
			<KeyboardBox id="switch-condition-keyboard-keycode" v-focus />
			<div class="text">{{ t('components.switch-condition-gamepad-button.label') }}</div>
			<GamepadBox id="switch-condition-gamepad-button" v-focus />
			<div class="text">{{ t('components.switch-condition-mouse-button.label') }}</div>
			<SelectBox id="switch-condition-mouse-button" v-model="form.mouseButton" />
			<div class="text">{{ t('components.switch-condition-variable-variable.label') }}</div>
			<CustomBox
				id="switch-condition-variable-variable"
				v-focus
				type="variable"
				filter="all"
				v-model="form.variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { $ } from '@app/utils/dom';
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

const { t } = useI18n();

const onConfirm = () => {
	SwitchCondition?.confirm?.(new Event('click'));
};

onMounted(() => {
	const typeEl = $('#switch-condition-type');
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

	typeEl.enableHiddenMode().relate([
		{
			case: 'boolean',
			targets: [$('#switch-condition-boolean-value')]
		},
		{ case: 'number', targets: [$('#switch-condition-number-value')] },
		{ case: 'string', targets: [$('#switch-condition-string-value')] },
		{
			case: 'attribute',
			targets: [$('#switch-condition-attribute-attributeId')]
		},
		{ case: 'enum', targets: [$('#switch-condition-enum-stringId')] },
		{
			case: 'keyboard',
			targets: [$('#switch-condition-keyboard-keycode')]
		},
		{
			case: 'gamepad',
			targets: [$('#switch-condition-gamepad-button')]
		},
		{ case: 'mouse', targets: [$('#switch-condition-mouse-button')] },
		{
			case: 'variable',
			targets: [$('#switch-condition-variable-variable')]
		}
	]);

	$('#switch-condition-boolean-value')?.loadItems([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	]);

	$('#switch-condition-mouse-button')?.loadItems([
		{ name: 'Left Button', value: 0 },
		{ name: 'Middle Button', value: 1 },
		{ name: 'Right Button', value: 2 },
		{ name: 'Back Button', value: 3 },
		{ name: 'Forward Button', value: 4 }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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

<template>
	<WindowFrame id="setList" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setList.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Variable</div>
			<CustomBox
				id="setList-variable"
				type="variable"
				filter="object"
				:model-value="form.variable"
				@input="onVariable"
			/>
			<div class="text">Operation</div>
			<SelectBox id="setList-operation" v-model="form.operation" />
			<div class="text">Numbers</div>
			<CustomBox
				id="setList-numbers"
				type="array"
				filter="number"
				:model-value="form.numbers ?? []"
				@input="onNumbers"
			/>
			<div class="text">Strings</div>
			<CustomBox
				id="setList-strings"
				type="array"
				filter="string"
				:model-value="form.strings ?? []"
				@input="onStrings"
			/>
			<div class="text">Index</div>
			<NumberVar id="setList-index" min="0" max="1000000000" v-model="form.index" />
			<div class="text">Boolean</div>
			<SelectBox id="setList-boolean" v-model="form.boolean" />
			<div class="text">Number</div>
			<NumberBox
				id="setList-number"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.number"
			/>
			<div class="text">String</div>
			<TextArea id="setList-string" v-model="form.string" />
			<div class="text">Variable</div>
			<CustomBox
				id="setList-operand"
				type="variable"
				filter="all"
				:model-value="form.operand"
				@input="onOperand"
			/>
			<div class="text">Separator</div>
			<TextAreaVar id="setList-separator" v-model="form.separator" />
			<div class="text">Attribute Group</div>
			<CustomBox
				id="setList-attribute-groupId"
				type="attribute-group"
				:model-value="form.attributeGroupId"
				@input="onAttributeGroupId"
			/>
			<div class="text">Enum Group</div>
			<CustomBox
				id="setList-enum-groupId"
				type="enum-group"
				:model-value="form.enumGroupId"
				@input="onEnumGroupId"
			/>
			<div class="text">Actor</div>
			<CustomBox id="setList-actor" type="actor" :model-value="form.actor" @input="onActor" />
			<div class="text">Default</div>
			<CheckBox
				id="setList-index-skip-check"
				class="standard"
				v-model="form.indexSkipCheck"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetListCommandSchema } from '@app/composables/commands/useSetListCommandSchema';
import { $ } from '@app/utils/dom';
import { createGetter } from '@app/i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextAreaVar from '@app/components/common/TextAreaVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetListCommandSchema();

const onVariable = (value: unknown) => {
	form.variable = value;
};

const onNumbers = (value: unknown) => {
	form.numbers = value;
};

const onStrings = (value: unknown) => {
	form.strings = value;
};

const onOperand = (value: unknown) => {
	form.operand = value;
};

const onAttributeGroupId = (value: unknown) => {
	form.attributeGroupId = value;
};

const onEnumGroupId = (value: unknown) => {
	form.enumGroupId = value;
};

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	const get = createGetter('command.setList');
	$('#setList-operation')?.loadItems?.([
		{ name: 'Set to Empty', value: 'set-empty' },
		{ name: 'Set Numbers', value: 'set-numbers' },
		{ name: 'Set Strings', value: 'set-strings' },
		{ name: 'Set Boolean', value: 'set-boolean' },
		{ name: 'Set Number', value: 'set-number' },
		{ name: 'Set String', value: 'set-string' },
		{ name: 'Set Variable', value: 'set-variable' },
		{ name: get('split-string') || 'Split String', value: 'split-string' },
		{ name: 'Push', value: 'push' },
		{ name: 'Remove', value: 'remove' },
		{ name: get('get-attribute-names') || 'Get Attribute Names', value: 'get-attribute-names' },
		{ name: get('get-attribute-keys') || 'Get Attribute Keys', value: 'get-attribute-keys' },
		{ name: get('get-enum-names') || 'Get Enumeration Names', value: 'get-enum-names' },
		{ name: get('get-enum-values') || 'Get Enumeration Values', value: 'get-enum-values' },
		{ name: get('get-actor-targets') || 'Get Actor Targets', value: 'get-actor-targets' }
	]);
	$('#setList-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: 'set-numbers', targets: [$('#setList-numbers')] },
			{ case: 'set-strings', targets: [$('#setList-strings')] },
			{
				case: 'set-boolean',
				targets: [
					$('#setList-index'),
					$('#setList-index-skip-check'),
					$('#setList-boolean')
				]
			},
			{
				case: 'set-number',
				targets: [$('#setList-index'), $('#setList-index-skip-check'), $('#setList-number')]
			},
			{
				case: 'set-string',
				targets: [$('#setList-index'), $('#setList-index-skip-check'), $('#setList-string')]
			},
			{
				case: 'set-variable',
				targets: [
					$('#setList-index'),
					$('#setList-index-skip-check'),
					$('#setList-operand')
				]
			},
			{
				case: 'split-string',
				targets: [$('#setList-operand'), $('#setList-separator')]
			},
			{ case: ['push', 'remove'], targets: [$('#setList-operand')] },
			{
				case: ['get-attribute-names', 'get-attribute-keys'],
				targets: [$('#setList-attribute-groupId')]
			},
			{
				case: ['get-enum-names', 'get-enum-values'],
				targets: [$('#setList-enum-groupId')]
			},
			{ case: 'get-actor-targets', targets: [$('#setList-actor')] }
		]);
	$('#setList-boolean')?.loadItems?.([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	]);
});
</script>

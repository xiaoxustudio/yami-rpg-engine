<template>
	<WindowFrame id="setBoolean" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.setBoolean.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Variable</div
				><CustomBox
					id="setBoolean-variable"
					type="variable"
					filter="writable-boolean"
					v-model="form.variable"
				/>
				<div class="text">Operation</div><SelectBox id="setBoolean-operation" v-model="form.operation" />
				<div class="text">Type</div><SelectBox id="setBoolean-operand-type" v-model="form['operand-type']" @write="onWrite" />
				<div class="text">Constant</div><SelectBox id="setBoolean-constant-value" v-model="form['constant-value']" />
				<div class="text">Variable</div
				><CustomBox id="setBoolean-common-variable" type="variable" filter="all" v-model="form['common-variable']" />
				<div class="text">Index</div
				><NumberVar id="setBoolean-list-index" min="0" max="1000000000" v-model="form['list-index']" />
				<div class="text">Param Name</div><StringVar id="setBoolean-parameter-key" v-model="form['parameter-key']" />
				<div class="text">Script</div><TextBox id="setBoolean-script" v-model="form.script" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { $ } from '@app/utils/dom';
import { useSetBooleanCommandSchema } from '@app/composables/commands/useSetBooleanCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save, writeHandler } = useSetBooleanCommandSchema();

const onWrite = (value: unknown) => {
	writeHandler?.({ value: value as string });
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setBoolean-operation')?.loadItems?.([
		{ name: 'Set', value: 'set' },
		{ name: 'Not', value: 'not' },
		{ name: 'And', value: 'and' },
		{ name: 'Or', value: 'or' },
		{ name: 'Xor', value: 'xor' }
	]);
	$('#setBoolean-operand-type')?.loadItems?.([
		{ name: 'Constant', value: 'constant' },
		{ name: 'Variable', value: 'variable' },
		{ name: 'List', value: 'list' },
		{ name: 'Parameter', value: 'parameter' },
		{ name: 'Script', value: 'script' }
	]);
	$('#setBoolean-operand-type')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: 'constant',
				targets: [$('#setBoolean-constant-value')]
			},
			{
				case: 'variable',
				targets: [$('#setBoolean-common-variable')]
			},
			{
				case: 'list',
				targets: [$('#setBoolean-common-variable'), $('#setBoolean-list-index')]
			},
			{
				case: 'parameter',
				targets: [$('#setBoolean-parameter-key')]
			},
			{ case: 'script', targets: [$('#setBoolean-script')] }
		]);
	$('#setBoolean-constant-value')?.loadItems?.([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	]);
});

</script>

<template>
	<div class="field-set" id="variable-properties-fieldset">
		<div class="legend">{{ t('components.variable-properties-flex.label') }}</div>
		<div
			class="flex-box"
			id="variable-properties-flex"
			:ref="registryRef(variableEls, 'variable-properties-flex')"
		>
			<div class="flex-item">
				<div class="text">{{ t('components.variable-name.label') }}</div>
				<TextBox
					:label="t('components.variable-name.label')"
					id="variable-name"
					v-tip="t('components.variable-name.tip')"
					:ref="registryRef(variableEls, 'variable-name')"
					@input="onNameInput"
				/>
			</div>
			<div class="flex-item">
				<div class="text">{{ t('components.variable-sort-normal.label') }}</div>
				<RadioBox
					id="variable-sort-normal"
					name="variable-sort"
					class="standard"
					value="0"
					@input="onSortInput"
					@write="onSortWrite"
					><div
						class="text"
						id="variable-sort-normal-label"
						v-tip="t('components.variable-sort-normal-label.tip')"
					>
						{{ t('components.variable-sort-normal-label.content') }}
					</div></RadioBox
				>
				<RadioBox
					id="variable-sort-shared"
					name="variable-sort"
					class="standard"
					value="1"
					@input="onSortInput"
					@write="onSortWrite"
					><div
						class="text"
						id="variable-sort-shared-label"
						v-tip="t('components.variable-sort-shared-label.tip')"
					>
						{{ t('components.variable-sort-shared-label.content') }}
					</div></RadioBox
				>
				<RadioBox
					id="variable-sort-temporary"
					name="variable-sort"
					class="standard"
					value="2"
					@input="onSortInput"
					@write="onSortWrite"
					><div
						class="text"
						id="variable-sort-temporary-label"
						v-tip="t('components.variable-sort-temporary-label.tip')"
					>
						{{ t('components.variable-sort-temporary-label.content') }}
					</div></RadioBox
				>
			</div>
			<div class="flex-item">
				<div class="text">{{ t('components.variable-type-boolean.label') }}</div>
				<RadioBox
					id="variable-type-boolean"
					name="variable-type"
					class="standard"
					value="boolean"
					@input="onTypeInput"
					@write="onTypeWrite"
					><div
						class="text"
						id="variable-type-boolean-label"
						v-tip="t('components.variable-type-boolean-label.tip')"
					>
						{{ t('components.variable-type-boolean-label.content') }}
					</div></RadioBox
				>
				<RadioBox
					id="variable-type-number"
					name="variable-type"
					class="standard"
					value="number"
					@input="onTypeInput"
					@write="onTypeWrite"
					><div
						class="text"
						id="variable-type-number-label"
						v-tip="t('components.variable-type-number-label.tip')"
					>
						{{ t('components.variable-type-number-label.content') }}
					</div></RadioBox
				>
				<RadioBox
					id="variable-type-string"
					name="variable-type"
					class="standard"
					value="string"
					@input="onTypeInput"
					@write="onTypeWrite"
					><div
						class="text"
						id="variable-type-string-label"
						v-tip="t('components.variable-type-string-label.tip')"
					>
						{{ t('components.variable-type-string-label.content') }}
					</div></RadioBox
				>
				<RadioBox
					id="variable-type-object"
					:ref="registryRef(variableEls, 'variable-type-object')"
					name="variable-type"
					class="standard"
					value="object"
					@input="onTypeInput"
					@write="onTypeWrite"
					><div
						class="text"
						id="variable-type-object-label"
						v-tip="t('components.variable-type-object-label.tip')"
					>
						{{ t('components.variable-type-object-label.content') }}
					</div></RadioBox
				>
			</div>
			<div
				class="flex-item"
				id="variable-value-box"
				:ref="registryRef(variableEls, 'variable-value-box')"
			>
				<div class="text">{{ t('components.variable-value-manager.label') }}</div>
				<PageManager
					id="variable-value-manager"
					:ref="registryRef(variableEls, 'variable-value-manager')"
				>
					<div class="page-frame" value="boolean">
						<RadioBox
							id="variable-value-boolean-false"
							v-tip="t('components.variable-value-boolean-false.tip')"
							name="variable-value-boolean"
							class="standard"
							value="false"
							>False</RadioBox
						>
						<RadioBox
							id="variable-value-boolean-true"
							v-tip="t('components.variable-value-boolean-true.tip')"
							name="variable-value-boolean"
							class="standard"
							value="true"
							>True</RadioBox
						>
					</div>
					<div class="page-frame" value="number">
						<NumberBox
							id="variable-value-number"
							v-tip="t('components.variable-value-number.tip')"
							:ref="registryRef(variableEls, 'variable-value-number')"
							min="-1000000000"
							max="1000000000"
							decimals="10"
						/>
					</div>
					<div class="page-frame" value="string">
						<TextArea
							id="variable-value-string"
							v-tip="t('components.variable-value-string.tip')"
							:ref="registryRef(variableEls, 'variable-value-string')"
						/>
					</div>
				</PageManager>
			</div>
			<div class="flex-item">
				<div class="text">{{ t('components.variable-note.label') }}</div>
				<TextArea
					:label="t('components.variable-note.label')"
					id="variable-note"
					v-tip="t('components.variable-note.tip')"
					:ref="registryRef(variableEls, 'variable-note')"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { variableEls } from '@app/variable/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { Variable } from '@app/variable/variable.ts';
import PageManager from '@app/components/common/PageManager.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const onNameInput = (value: string) => {
	Variable?.nameInput?.({ target: { value } } as Event & { target: HTMLInputElement });
};
let lastSortValue: number | string | boolean | undefined;
let lastSortWriteValue: number | string | boolean | undefined;
let lastTypeValue: number | string | boolean | undefined;
let lastTypeWriteValue: number | string | boolean | undefined;
const onSortInput = (value: number | string | boolean) => {
	if (lastSortValue !== value) {
		lastSortValue = value;
		Variable?.sortInput?.({ value } as Event & { value: number | string | boolean });
	}
};
const onSortWrite = (value: number | string | boolean) => {
	if (lastSortWriteValue !== value) {
		lastSortWriteValue = value;
		Variable?.sortWrite?.({ value } as Event & { value: number | string | boolean });
	}
};
const onTypeInput = (value: number | string | boolean) => {
	if (lastTypeValue !== value) {
		lastTypeValue = value;
		Variable?.typeInput?.({ value } as Event & { value: number | string | boolean });
	}
};
const onTypeWrite = (value: number | string | boolean) => {
	if (lastTypeWriteValue !== value) {
		lastTypeWriteValue = value;
		Variable?.typeWrite?.({ value } as Event & { value: number | string | boolean });
	}
};
</script>

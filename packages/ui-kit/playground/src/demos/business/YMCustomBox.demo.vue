<script setup lang="ts">
import { ref } from 'vue';
import { YMCustomBox, YMButton } from '@ui-kit';

interface ParseResult {
	text: string;
	invalid?: boolean;
}

type GetterElement = HTMLElement & { read(): unknown; write(value: unknown): void };

let guidCounter = 0;

const getters: Record<string, (el: GetterElement) => void> = {
	file: (el) => {
		guidCounter++;
		el.write(`mock-guid-${String(guidCounter).padStart(4, '0')}`);
	},
	'dialog-dir': (el) => {
		fileDialog(el.read()).then(({ filePaths }) => {
			if (filePaths.length === 1) {
				el.write(filePaths[0]);
			}
		});
	}
};

const parsers: Record<string, (value: unknown) => ParseResult> = {
	file: (value) => ({
		text: value ? `File: ${String(value)}` : 'None'
	}),
	'dialog-dir': (value) => ({
		text: value ? String(value) : 'None'
	}),
	number: (value) => {
		const num = Number(value);
		return {
			text: value === '' || value == null ? 'None' : String(value),
			invalid: value !== '' && value != null && Number.isNaN(num)
		};
	}
};

const fileDialog = (defaultPath: unknown): Promise<{ filePaths: string[] }> =>
	Promise.resolve({ filePaths: [String(defaultPath || '/mock/workspace')] });

const fileValue = ref('');
const dirValue = ref('/mock/workspace/project');
const numberValue = ref(42);
const disabled = ref(false);
const lastWrite = ref('');

const onWrite = (value: unknown) => {
	lastWrite.value = `write: ${JSON.stringify(value)}`;
};

const toggleDisabled = () => {
	disabled.value = !disabled.value;
};
</script>

<template>
	<section class="demo">
		<h2>YMCustomBox</h2>
		<p class="desc">
			自定义选择框：点击触发 getter（模拟文件选择/目录选择），parsers 负责展示与非法值标红。
		</p>
		<div class="row">
			<div class="field">
				<span class="label">file</span>
				<YMCustomBox
					id="custombox-file"
					type="file"
					filter="image"
					v-model="fileValue"
					:getters="getters"
					:parsers="parsers"
					@write="onWrite"
				/>
			</div>
			<div class="field">
				<span class="label">dialog-dir</span>
				<YMCustomBox
					id="custombox-dir"
					type="dialog-dir"
					v-model="dirValue"
					:getters="getters"
					:parsers="parsers"
					:file-dialog="fileDialog"
					@write="onWrite"
				/>
			</div>
			<div class="field">
				<span class="label">number</span>
				<YMCustomBox
					id="custombox-number"
					type="number"
					v-model="numberValue"
					:getters="getters"
					:parsers="parsers"
					:disabled="disabled"
					@write="onWrite"
				/>
			</div>
		</div>
		<div class="row">
			<YMButton @click="toggleDisabled">Toggle Disabled</YMButton>
			<span class="hint"
				>file={{ fileValue }} dir={{ dirValue }} number={{ numberValue }}</span
			>
		</div>
		<div class="row">
			<span class="hint">{{ lastWrite }}</span>
		</div>
	</section>
</template>

<style scoped>
.demo {
	margin-bottom: 24px;
}

.row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12px;
	margin: 8px 0;
}

.field {
	display: flex;
	align-items: center;
	gap: 8px;
	min-width: 220px;
}

.label {
	color: var(--ym-color-text);
	opacity: 0.8;
	font-size: 0.9em;
	font-family: var(--ym-font-mono);
}

.hint {
	color: var(--ym-color-text);
	opacity: 0.8;
	font-size: 0.9em;
}

.desc {
	color: var(--ym-color-text);
	opacity: 0.7;
	font-size: 0.9em;
	margin: 4px 0;
}
</style>

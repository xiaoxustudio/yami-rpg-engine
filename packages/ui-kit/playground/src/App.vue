<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import {
	YMButton,
	YMCheckBox,
	YMSwitchItem,
	YMEmptyState,
	YMLoadingOverlay,
	YMConfirmation,
	YMRename,
	YMZoom,
	YMSetKey,
	YMSetQuantity,
	ThemeProvider
} from '@ui-kit';

const click = (msg: string) => () => {
	console.log('[ui-kit playground] click:', msg);
};

const checked = ref(false);
const switchValue = ref(0);
const loadingVisible = ref(false);

const confirmationIndex = ref(-1);
const renameValue = ref('untitled');
const zoomValue = ref(1);
const setKeyValue = ref('');
const setQuantityValue = ref(1);

interface WindowFrameHost {
	positionMode?: string;
	frames?: HTMLElement[] & {
		append(element: HTMLElement): boolean;
		remove(element: HTMLElement): boolean;
	};
	ambient?: { update(): void };
	close?(id?: string): void;
}

const frames = [] as HTMLElement[] & {
	append(element: HTMLElement): boolean;
	remove(element: HTMLElement): boolean;
};
frames.append = (element: HTMLElement) => {
	if (frames.indexOf(element) !== -1) {
		return false;
	}
	frames.push(element);
	document.body.appendChild(element);
	element.classList.add('open');
	return true;
};
frames.remove = (element: HTMLElement) => {
	const index = frames.indexOf(element);
	if (index === -1) {
		return false;
	}
	frames.splice(index, 1);
	element.classList.remove('open');
	return true;
};

const mockWindow: WindowFrameHost = {
	positionMode: 'center',
	frames,
	ambient: { update() {} },
	close(id?: string) {
		const el = frames.find((frame) => frame.id === id);
		if (el) {
			frames.remove(el);
		}
	}
};

type FrameElement = HTMLElement & { open?(): void; close?(): boolean };

const openDialog = (id: string) => {
	(document.getElementById(id) as FrameElement | null)?.open?.();
};

const closeDialog = (id: string) => {
	(document.getElementById(id) as FrameElement | null)?.close?.();
};

const onConfirmationConfirm = (index: number) => {
	confirmationIndex.value = index;
	console.log('[ui-kit playground] confirmation confirm:', index);
	closeDialog('confirmation');
};

const onRenameConfirm = () => {
	console.log('[ui-kit playground] rename confirm:', renameValue.value);
	closeDialog('rename');
};

const onZoomConfirm = () => {
	console.log('[ui-kit playground] zoom confirm:', zoomValue.value);
	closeDialog('zoom');
};

const onSetKeyConfirm = () => {
	console.log('[ui-kit playground] setKey confirm:', setKeyValue.value);
	closeDialog('setKey');
};

const onSetQuantityConfirm = () => {
	console.log('[ui-kit playground] setQuantity confirm:', setQuantityValue.value);
	closeDialog('setQuantity');
};

onMounted(() => {
	(window as Window & { Window?: WindowFrameHost }).Window = mockWindow;
});

onUnmounted(() => {
	(window as unknown as { Window?: unknown }).Window = undefined;
});
</script>

<template>
	<ThemeProvider>
		<div class="page">
			<h1>@yami/ui-kit Playground</h1>
			<section>
				<h2>YMButton</h2>
				<div class="row">
					<YMButton variant="primary" @click="click('primary')">Primary</YMButton>
					<YMButton variant="default" @click="click('default')">Default</YMButton>
					<YMButton variant="danger" @click="click('danger')">Danger</YMButton>
				</div>
				<div class="row">
					<YMButton size="sm">Small</YMButton>
					<YMButton size="md">Medium</YMButton>
					<YMButton size="lg">Large</YMButton>
				</div>
				<div class="row">
					<YMButton disabled>Disabled</YMButton>
				</div>
			</section>
			<section>
				<h2>YMCheckBox</h2>
				<div class="row">
					<YMCheckBox v-model="checked">Normal {{ checked }}</YMCheckBox>
					<YMCheckBox standard>Standard</YMCheckBox>
					<YMCheckBox standard large>Standard Large</YMCheckBox>
					<YMCheckBox disabled>Disabled</YMCheckBox>
				</div>
			</section>
			<section>
				<h2>YMSwitchItem</h2>
				<div class="row">
					<YMSwitchItem v-model="switchValue" :length="4" />
					<span class="hint">value: {{ switchValue }}</span>
				</div>
			</section>
			<section>
				<h2>YMEmptyState</h2>
				<YMEmptyState message="No data found" icon="" />
			</section>
			<section>
				<h2>YMLoadingOverlay</h2>
				<div class="row">
					<YMButton variant="primary" @click="loadingVisible = !loadingVisible">
						Toggle Loading
					</YMButton>
					<YMLoadingOverlay :visible="loadingVisible" text="Loading..." />
				</div>
			</section>
			<section>
				<h2>YMConfirmation</h2>
				<p class="desc">A confirmation window with up to 3 buttons, centered on screen.</p>
				<div class="row">
					<YMButton variant="primary" @click="openDialog('confirmation')">Open Confirmation</YMButton>
					<span class="hint">last choice: {{ confirmationIndex }}</span>
				</div>
				<YMConfirmation
					message="Are you sure you want to delete this item?"
					:items="[{ label: 'Delete' }, { label: 'Cancel' }, { label: 'Details' }]"
					@confirm="onConfirmationConfirm"
				/>
			</section>
			<section>
				<h2>YMRename</h2>
				<p class="desc">Rename window with a text input bound via v-model.</p>
				<div class="row">
					<YMButton variant="primary" @click="openDialog('rename')">Open Rename</YMButton>
					<span class="hint">value: {{ renameValue }}</span>
				</div>
				<YMRename v-model="renameValue" label="Name" title="Rename" @confirm="onRenameConfirm" />
			</section>
			<section>
				<h2>YMZoom</h2>
				<p class="desc">Zoom window with a numeric factor bound via v-model.</p>
				<div class="row">
					<YMButton variant="primary" @click="openDialog('zoom')">Open Zoom</YMButton>
					<span class="hint">value: {{ zoomValue }}</span>
				</div>
				<YMZoom v-model="zoomValue" label="Factor" title="Zoom" @confirm="onZoomConfirm" />
			</section>
			<section>
				<h2>YMSetKey</h2>
				<p class="desc">Set-key window with a text input bound via v-model.</p>
				<div class="row">
					<YMButton variant="primary" @click="openDialog('setKey')">Open Set Key</YMButton>
					<span class="hint">value: {{ setKeyValue }}</span>
				</div>
				<YMSetKey v-model="setKeyValue" label="Key" title="Set Key" @confirm="onSetKeyConfirm" />
			</section>
			<section>
				<h2>YMSetQuantity</h2>
				<p class="desc">Set-quantity window with a numeric value bound via v-model.</p>
				<div class="row">
					<YMButton variant="primary" @click="openDialog('setQuantity')">Open Set Quantity</YMButton>
					<span class="hint">value: {{ setQuantityValue }}</span>
				</div>
				<YMSetQuantity
					v-model="setQuantityValue"
					:max="99"
					label="Quantity"
					title="Set Quantity"
					@confirm="onSetQuantityConfirm"
				/>
			</section>
		</div>
	</ThemeProvider>
</template>

<style scoped>
.page {
	max-width: 720px;
	margin: 0 auto;
	padding: 32px;
	font-family: var(--ym-font-sans);
	color: var(--ym-color-text);
	background: var(--ym-color-surface);
	min-height: 100vh;
}

.row {
	display: flex;
	align-items: center;
	gap: 12px;
	margin: 8px 0;
}

.hint {
	color: var(--ym-color-text);
}

.desc {
	color: var(--ym-color-text);
	opacity: 0.7;
	font-size: 0.9em;
	margin: 4px 0;
}
</style>

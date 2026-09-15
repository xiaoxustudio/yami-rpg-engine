import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import NewProjectWindow from '@app/components/tools/NewProject.vue';
import DeploymentWindow from '@app/components/tools/Deployment.vue';
import { NewProject, newProjectConfirmDisabled } from '@app/title/new-project-window.ts';
import {
	Deployment,
	DeploymentForm,
	deploymentConfirmDisabled
} from '@app/title/deploy-project-window';
import { Editor } from '@app/services/project/editor.ts';
import { vTip } from '@app/directives/tip';

// 模板里的 v-tip 不在 vitest.setup 里注册（setup 期 import 会让 tip.spec 的模块 mock 失效），
// 需要它的用例自带指令。
const mountOptions = { attachTo: document.body, global: { directives: { tip: vTip } } };

/**
 * P5b 尾项：表单无效时确认按钮必须真的禁用。
 *
 * 原先两个窗口模块对 `#newProject-confirm` / `#deployment-confirm` 调 `disable()/enable()`，
 * 而这两个按钮由 `WindowFrame → YMWindowFrame → YMFormButtons` 生成（不在元素注册表里），
 * P5b 迁移后那些调用恒为 no-op ⇒ 无效输入也能提交。现在走属性链：
 * 模块的响应式标志 → `WindowFrame` 的 `confirm-disabled` → `button[name="confirm"]` 的 `:disabled`。
 */
const confirmButton = (id: string): HTMLButtonElement => {
	const el = document.getElementById(id);
	expect(el, `#${id} 未渲染`).toBeTruthy();
	return el as HTMLButtonElement;
};

const nonExistentFolder = (): string => `__dsh-missing-${Date.now()}-${Math.random()}`;

describe('窗口确认按钮的禁用态（P5b 尾项）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('NewProject：文件夹名为空/已存在时确认禁用，可用时启用', async () => {
		const wrapper = mount(NewProjectWindow, mountOptions);
		await wrapper.vm.$nextTick();

		NewProject.form.folder = '';
		NewProject.check!();
		await wrapper.vm.$nextTick();
		expect(newProjectConfirmDisabled.value).toBe(true);
		expect(confirmButton('newProject-confirm').disabled).toBe(true);

		NewProject.form.folder = nonExistentFolder();
		NewProject.check!();
		await wrapper.vm.$nextTick();
		expect(newProjectConfirmDisabled.value).toBe(false);
		expect(confirmButton('newProject-confirm').disabled).toBe(false);

		// 已存在的目录（用仓库根 package.json 的上级目录 + 该文件名凑出一个必然存在的路径）
		NewProject.form.location = process.cwd();
		NewProject.form.folder = 'package.json';
		NewProject.check!();
		await wrapper.vm.$nextTick();
		expect(newProjectConfirmDisabled.value).toBe(true);
		expect(confirmButton('newProject-confirm').disabled).toBe(true);

		wrapper.unmount();
	});

	it('NewProject：「最小化当前项目」在编辑器关闭时禁止确认，打开时放行', async () => {
		const wrapper = mount(NewProjectWindow, mountOptions);
		await wrapper.vm.$nextTick();

		NewProject.form.location = process.cwd();
		NewProject.form.folder = nonExistentFolder();
		NewProject.form.template = 'minimized-project';

		Editor.state = 'closed';
		NewProject.check!();
		await wrapper.vm.$nextTick();
		expect(confirmButton('newProject-confirm').disabled).toBe(true);

		Editor.state = 'open';
		NewProject.check!();
		await wrapper.vm.$nextTick();
		expect(confirmButton('newProject-confirm').disabled).toBe(false);

		// 换成模板项目后与编辑器状态无关
		Editor.state = 'closed';
		NewProject.form.template = 'arpg-ts-english';
		NewProject.check!();
		await wrapper.vm.$nextTick();
		expect(confirmButton('newProject-confirm').disabled).toBe(false);

		wrapper.unmount();
	});

	it('Deployment：文件夹名为空/已存在时确认禁用，可用时启用', async () => {
		const wrapper = mount(DeploymentWindow, mountOptions);
		await wrapper.vm.$nextTick();

		DeploymentForm.platform = 'windows-x64';
		DeploymentForm.folder = '';
		Deployment.check!();
		await wrapper.vm.$nextTick();
		expect(deploymentConfirmDisabled.value).toBe(true);
		expect(confirmButton('deployment-confirm').disabled).toBe(true);

		DeploymentForm.folder = nonExistentFolder();
		Deployment.check!();
		await wrapper.vm.$nextTick();
		expect(deploymentConfirmDisabled.value).toBe(false);
		expect(confirmButton('deployment-confirm').disabled).toBe(false);

		DeploymentForm.location = process.cwd();
		DeploymentForm.folder = 'package.json';
		Deployment.check!();
		await wrapper.vm.$nextTick();
		expect(confirmButton('deployment-confirm').disabled).toBe(true);

		wrapper.unmount();
	});
});

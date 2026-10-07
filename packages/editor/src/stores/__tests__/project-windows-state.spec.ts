import { beforeEach, describe, expect, it } from 'vitest';
import { isReactive } from 'vue';
import { getNewProjectStore } from '@app/stores/new-project';
import { getDeploymentStore } from '@app/stores/deployment';

describe('NewProject 表单 → stores/newProject', () => {
	beforeEach(async () => {
		const store = getNewProjectStore();
		store.form.template = '';
		store.form.folder = '';
		store.form.location = '';
		store.confirmDisabled = false;
	});

	it('form 是可读写访问器，读写落在 store（含 Object.assign 路径）', async () => {
		const { NewProject } = await import('@app/title/new-project-window.ts');
		const { newProjectConfirmDisabled } = await import('@app/title/new-project-window.ts');
		Object.assign(NewProject.form, {
			template: 'minimized-project',
			folder: 'a',
			location: 'b'
		});
		const store = getNewProjectStore();
		expect(store.form).toEqual({ template: 'minimized-project', folder: 'a', location: 'b' });
		expect(isReactive(store.form)).toBe(true);

		store.form.folder = 'c';
		expect(NewProject.form.folder).toBe('c');
		expect(newProjectConfirmDisabled.value).toBe(false);
	});

	it('确认态是 ref 形状（可写 computed），读写落在 store', async () => {
		const { newProjectConfirmDisabled } = await import('@app/title/new-project-window.ts');
		newProjectConfirmDisabled.value = true;
		expect(getNewProjectStore().confirmDisabled).toBe(true);

		getNewProjectStore().confirmDisabled = false;
		expect(newProjectConfirmDisabled.value).toBe(false);
	});
});

describe('Deployment 表单 → stores/deployment', () => {
	beforeEach(() => {
		const store = getDeploymentStore();
		store.form.platform = 'windows-x64';
		store.form.folder = '';
		store.form.location = '';
		store.confirmDisabled = false;
	});

	it('DeploymentForm 读写落在 store（含外部就地改值的用法）', async () => {
		const { DeploymentForm } = await import('@app/title/deploy-project-window.ts');
		DeploymentForm.platform = 'web';
		expect(getDeploymentStore().form.platform).toBe('web');

		Object.assign(DeploymentForm, { folder: 'app', location: '/tmp' });
		const store = getDeploymentStore();
		expect(store.form.folder).toBe('app');
		expect(store.form.location).toBe('/tmp');

		store.form.platform = 'mac-universal';
		expect(DeploymentForm.platform).toBe('mac-universal');
	});

	it('确认态是 ref 形状（可写 computed），读写落在 store', async () => {
		const { deploymentConfirmDisabled } = await import('@app/title/deploy-project-window.ts');
		deploymentConfirmDisabled.value = true;
		expect(getDeploymentStore().confirmDisabled).toBe(true);

		getDeploymentStore().confirmDisabled = false;
		expect(deploymentConfirmDisabled.value).toBe(false);
	});
});

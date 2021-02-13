import * as vscode from 'vscode';
import { checkPackageAndConfig, getConfig, selectComponentName, selectFiles, createCommand } from './helpers';
import { runInTerminal } from './terminal';

export function activate(context: vscode.ExtensionContext) {

	let create = vscode.commands.registerCommand('vs-rcci.create', async event => {
		if (checkPackageAndConfig()) {
			const { config, template } = (await getConfig()) ?? {};
			if (!config) {
				return;
			}

			const componentName = await selectComponentName();
			if (!componentName) {
				return;
			}

			const filesToCreate = await selectFiles(config);
			if (!filesToCreate) {
				return;
			}

			runInTerminal(createCommand({
				dest: event.fsPath,
				name: componentName,
				type: template,
				files: filesToCreate,
				noSearch: true,
				skipLastStep: true
			}));
		}
	});

	let update = vscode.commands.registerCommand('vs-rcci.update', async event => {
		if (checkPackageAndConfig()) {
			const { config, template } = await getConfig() ?? {};
			if (!config) {
				return;
			}

			const filesToCreate = await selectFiles(config, true);
			if (!filesToCreate || filesToCreate === 'no') {
				return;
			}

			runInTerminal(createCommand({
				dest: event.fsPath,
				type: template,
				files: filesToCreate,
				update: true,
				noSearch: true,
				skipLastStep: true
			}));
		}
	});

	context.subscriptions.push(create, update);
}

export function deactivate() { }

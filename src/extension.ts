import * as vscode from 'vscode';
import { checkPackageAndConfig, getConfig, applyTemplate, selectComponentName, selectTemplate } from './helpers';
import { TemplateDescription } from './types';

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('vs-rcci.create', async event => {
		if (checkPackageAndConfig()) {
			const config = await getConfig();
			if (Array.isArray(config.templates)) {
				const selectedTemplate = await selectTemplate(config);
				if (!selectedTemplate) {
					return;
				}
				applyTemplate(config, selectedTemplate);
			}

			const files = Object.entries(config.templates)
				.filter(([_, o]) => o.optional)
				.map(([name, options]: [string, TemplateDescription]) => ({
					label: name,
					picked: options.default ?? true
				}));
			const items = (await vscode.window.showQuickPick(files, { canPickMany: true })) ?? [];
			const filesToCreate = items.length === 0 ? 'no' : items.map(item => item.label).join(' ');

			const componentName = await selectComponentName();

			if (!componentName) {
				return;
			}

			const terminal = vscode.window.createTerminal('reactcci terminal');
			terminal.sendText(`npx rcci --dest "${event.fsPath}" --skip-search --name "${componentName}" --files ${filesToCreate} --sls`);
			terminal.show();
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }

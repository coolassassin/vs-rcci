import { resolve } from 'dns';
import * as vscode from 'vscode';
import { checkPackageAndConfig, getConfig, applyTemplate } from './helpers';
import { MultiTemplate, Config, TemplateDescription } from './types';

const selectTemplate = async (config: Config): Promise<string | null> => {
	return new Promise(resolve => {
		const templateSelection = vscode.window.createQuickPick();
		templateSelection.items = (config.templates as MultiTemplate).map(tmp => ({ label: tmp.name }))
		templateSelection.onDidChangeSelection(items => {
			const selectedTemplate = items[0].label;
			resolve(selectedTemplate);
			templateSelection.hide();
		})
		templateSelection.onDidHide(() => {
			resolve(null);
		})
		templateSelection.show();
	})
}

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('vs-rcci.create', async event => {
		try {
			if (checkPackageAndConfig()) {
				const config = await getConfig();
				if (Array.isArray(config.templates)) {
					const selectedTemplate = await selectTemplate(config);
					if (!selectedTemplate) {
						return;
					}
					applyTemplate(config, selectedTemplate);
				}
				// const componentName = vscode.window.createInputBox();
				// componentName.placeholder = 'Enter component name or names divided by space';
				// componentName.show();
				// componentName.onDidAccept(() => {
				// 	componentName.hide();
				// 	// vscode.window.showInformationMessage(componentName.value);
				// 	const terminal = vscode.window.createTerminal('React create component terminal');
				// 	terminal.sendText(`npx rcci --dest "${event.fsPath}" --skip-search --name "${componentName.value}"`);
				// 	terminal.show();
				// })

				const files = Object.entries(config.templates)
					.filter(([_, o]) => o.optional)
					.map(([name, options]: [string, TemplateDescription]) => ({
						label: name,
						picked: options.default ?? true
					}));
				const items = (await vscode.window.showQuickPick(files, {canPickMany: true})) ?? [];
				console.log(items.map(item => item.label));
			}
		} catch (e) {
			console.error(e);
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }

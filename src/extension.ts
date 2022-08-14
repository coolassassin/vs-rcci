import * as vscode from 'vscode';
import { getConfig, selectComponentName, selectFiles, createCommand } from './helpers';
import { checkPackageAndConfig } from './init';
import { runInTerminal } from './terminal';

export function activate(context: vscode.ExtensionContext) {
    const create = vscode.commands.registerCommand('vs-rcci.create', async (event) => {
        if (await checkPackageAndConfig()) {
            const { config, template } = (await getConfig()) ?? {};
            if (!config) {
                return;
            }

            const componentName = await selectComponentName();
            if (!componentName) {
                return;
            }

            const filesToCreate = await selectFiles(event.fsPath, componentName, config);
            if (!filesToCreate) {
                return;
            }

            runInTerminal(
                createCommand({
                    dest: event.fsPath,
                    name: componentName,
                    template,
                    files: filesToCreate,
                    noSearch: true,
                    skipLastStep: true
                })
            );
        }
    });

    const update = vscode.commands.registerCommand('vs-rcci.update', async (event) => {
        if (await checkPackageAndConfig()) {
            const { config, template } = (await getConfig()) ?? {};
            if (!config) {
                return;
            }

            const componentName = event.fsPath.split('/').pop();
            
            const filesToUpdate = await selectFiles(event.fsPath, componentName, config, true);
            if (!filesToUpdate || filesToUpdate === 'no') {
                return;
            }
 
            runInTerminal(
                createCommand({
                    dest: event.fsPath,
                    template,
                    files: filesToUpdate,
                    update: true,
                    noSearch: true,
                    skipLastStep: true
                })
            );
        }
    });

    context.subscriptions.push(create, update);
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}

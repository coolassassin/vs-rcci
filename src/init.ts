import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { getRoot } from './helpers';
import { runInTerminal } from './terminal';

export const checkPackageAndConfig = async (): Promise<boolean> => {
    const root = getRoot();
    if (!root) {
        vscode.window.showErrorMessage('Error: Unexpected error');
        return false;
    }

    const isPackageExist = fs.existsSync(path.resolve(root, 'node_modules', 'reactcci'));
    if (!isPackageExist) {
        vscode.window.showErrorMessage('Error: reactcci package was not found');
        const res = await vscode.window.showQuickPick(
            [{ label: 'Yes', description: 'Add reactcci package into your project' }, { label: 'No' }], 
            { placeHolder: 'Do you want to install package?' }
        ) ?? { label: 'No' };
        if (res.label === 'Yes') {
            const isYarn = fs.existsSync(path.resolve(root, 'yarn.lock'));
            await runInTerminal(isYarn ? 'yarn add -D reactcci' : 'npm i -D reactcci');
            vscode.window.showInformationMessage(
                `Execute "${isYarn ? 'yarn run rcci' : 'npx rcci'}" after installation to configure package`
            );
        }
        return false;
    }

    const isConfigExists = fs.existsSync(path.resolve(root, 'rcci.config.js'));
    if (!isConfigExists) {
        vscode.window.showErrorMessage('Error: config file wasnt found (rcci.config.js)');
        const res = await vscode.window.showQuickPick(
            [{ label: 'Yes', description: 'Start reactcci package configuration?' }, { label: 'No' }], 
            { placeHolder: 'Do you want to config package?' }
        ) ?? { label: 'No' };
        if (res.label === 'Yes') {
            await runInTerminal('npx rcci');
        }
        return false;
    }

    return true;
};
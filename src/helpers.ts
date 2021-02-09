import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Config } from './types';

export const getRoot = () => {
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) {
        return;
    }
    return folder.uri.fsPath;
}

export const checkPackageAndConfig = (): boolean => {
    const root = getRoot();
    if (!root) {
        vscode.window.showErrorMessage('Error: Unexpected error');
        return false;
    }

    const isPackageExist = fs.existsSync(path.resolve(root, 'node_modules', 'reactcci'));
    if (!isPackageExist) {
        vscode.window.showErrorMessage('Error: reactcci package was not found');
        return false;
    }

    const isConfigExists = fs.existsSync(path.resolve(root, 'rcci.config.js'));
    if (!isConfigExists) {
        vscode.window.showErrorMessage('Error: config file wasnt found (rcci.config.js)');
        return false;
    }

    return true;
}

const readConfigFile = async (path: string): Promise<Config> => {
    const file = await fs.promises.readFile(path, { encoding: 'utf8' });
    let config: Config;
    return eval(file.replace('module.exports =', 'config ='));
    return config;
}

export const applyTemplate = (config: Config, template: string): void => {
    if (!Array.isArray(config.templates)) {
        return;
    }
    const tmpIndex = config.templates.findIndex(tmp => tmp.name === template);
    if (config.templates[tmpIndex].folderPath) {
        config.folderPath = config.templates[tmpIndex].folderPath as string;
    }
    config.templates = config.templates[tmpIndex].files;
}

export const getConfig = async (): Promise<Config> => {
    const root = getRoot() as string;
    let config: Config = await readConfigFile(path.resolve(root, 'node_modules', 'reactcci', 'defaultConfig.js'));
    const customConfig: Config = await readConfigFile(path.resolve(root, 'rcci.config.js'));
    config = { ...config, ...customConfig, placeholders: { ...config.placeholders, ...customConfig.placeholders } };
    if (Array.isArray(config.templates) && config.templates.length === 1) {
        applyTemplate(config, config.templates[0].name);
    }
    return config;
}
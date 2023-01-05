import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Config, MultiTemplate, TemplateDescription } from './types';
import { getComponentFileName } from './getComponentFileName';
import { QuickPickItem } from 'vscode';

export const getProjectRoot = (): string | null => {
    return (vscode.workspace.getConfiguration('vs-rcci').get('root') as string) ?? null;
};

export const getProjectSilentMode = (): boolean => {
    return !!(vscode.workspace.getConfiguration('vs-rcci').get('silent') ?? false);
};

export const getRoot = (): string | null => {
    const projectRoot = getProjectRoot();
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) {
        return null;
    }
    return projectRoot ? path.resolve(folder.uri.fsPath, projectRoot) : folder.uri.fsPath;
};

const readConfigFile = async (configPath: string): Promise<Config> => {
    const file = await fs.promises.readFile(configPath, { encoding: 'utf8' });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let config;
    return eval(file.replace('module.exports =', 'config ='));
};

export const applyTemplate = (config: Config, template: string): void => {
    if (!Array.isArray(config.templates)) {
        return;
    }
    const tmpIndex = config.templates.findIndex((tmp) => tmp.name === template);
    if (config.templates[tmpIndex].folderPath) {
        config.folderPath = config.templates[tmpIndex].folderPath as string;
    }
    config.templates = config.templates[tmpIndex].files;
};

export const getConfig = async (): Promise<{ config: Config; template?: string } | undefined> => {
    const root = getRoot();
    if (root === null) {
        return;
    }
    const config: Config = await readConfigFile(path.resolve(root, 'rcci.config.js'));

    let template;
    if (Array.isArray(config.templates)) {
        if (config.templates.length === 0) {
            return;
        } else if (config.templates.length === 1) {
            template = config.templates[0].name;
        } else {
            template = await selectTemplate(config);
        }
        if (!template) {
            return;
        }
        applyTemplate(config, template);
    }

    return { config, template };
};

export const selectTemplate = (config: Config): Promise<string | undefined> => {
    return new Promise((resolve) => {
        const templateSelection = vscode.window.createQuickPick();
        templateSelection.items = (config.templates as MultiTemplate).map((tmp) => ({ label: tmp.name }));
        templateSelection.onDidChangeSelection((items) => {
            const selectedTemplate = items[0].label;
            resolve(selectedTemplate);
            templateSelection.hide();
        });
        templateSelection.onDidHide(() => {
            resolve(undefined);
        });
        templateSelection.show();
    });
};

export const selectComponentName = (): Promise<string | undefined> => {
    return new Promise((resolve) => {
        const componentName = vscode.window.createInputBox();
        componentName.placeholder = 'Enter component name or names divided by space';
        componentName.show();
        componentName.onDidAccept(() => {
            if (componentName.value) {
                componentName.hide();
                resolve(componentName.value);
            } else {
                vscode.window.showErrorMessage("Component name can't be empty");
            }
        });
        componentName.onDidHide(() => {
            resolve(undefined);
        });
    });
};

export const selectFileTypes = async (
    config: Config,
    files: string[],
    checkRequired: boolean
): Promise<string[] | undefined> => {
    const entries: [string, TemplateDescription][] = Object.entries(config.templates);
    const filesWithTypes = entries.filter(([name, options]) => {
        return Array.isArray(options.file) && ((checkRequired && !options.optional) || files.includes(name));
    });

    if (filesWithTypes.length === 0) {
        return files;
    }

    const updatedFiles = [...files];

    for (const [fileName, fileOptions] of filesWithTypes) {
        if (Array.isArray(fileOptions.file)) {
            const types = fileOptions.file.map((t) => ({
                label: t.description,
                description: t.name
            }));
            const type = await vscode.window.showQuickPick(types);

            if (!type) {
                return;
            }

            const typeIndex = fileOptions.file.findIndex((t) => t.name === type.description);
            if (updatedFiles.includes(fileName)) {
                updatedFiles.map((f) => {
                    if (fileName !== f) {
                        return f;
                    }
                    return `${fileName}[${typeIndex}]`;
                });
            } else {
                updatedFiles.push(`${fileName}[${typeIndex}]`);
            }
        }
    }

    return updatedFiles;
};

export const selectFiles = async (
    folderPath: string,
    componentName: string,
    config: Config,
    update = false
): Promise<string | undefined> => {
    const templates: [string, TemplateDescription][] = Object.entries(config.templates);

    let files: vscode.QuickPickItem[] = [];
    files = templates
        .filter(([, o]) => update || o.optional)
        .map(([name, options]: [string, TemplateDescription]): QuickPickItem => {
            const filePrefix = getComponentFileName(componentName, config.processFileAndFolderName ?? 'PascalCase');
            const fileName = options.name.replace(/\[name]/g, filePrefix);
            const isFileExists = update && fs.existsSync(path.resolve(folderPath, fileName));
            return {
                label: name,
                description: `${fileName}${isFileExists ? ' (Replace)' : ''}`,
                picked: options.optional && (options.default ?? true) && !isFileExists
            };
        });

    if (!files.length) {
        return 'no';
    }

    const items = await vscode.window.showQuickPick(files, {
        canPickMany: true,
        placeHolder: update ? 'replace if already exists' : ''
    });

    if (!items || (items.length === 0 && update)) {
        return;
    }

    const selectedFiles = await selectFileTypes(
        config,
        items.map((item) => item.label),
        !update
    );

    if (!selectedFiles) {
        return;
    }

    return selectedFiles.length === 0 ? 'no' : selectedFiles.join(' ');
};

type CreateCommandOptions = {
    dest?: string;
    name?: string;
    template?: string;
    files?: string;
    noSearch?: boolean;
    skipLastStep?: boolean;
    update?: boolean;
};

export const createCommand = (options: CreateCommandOptions): string => {
    const command = ['npx rcci'];
    for (const key of ['dest', 'name', 'files', 'template'] as (keyof CreateCommandOptions)[]) {
        if (options[key]) {
            command.push(`--${key} "${options[key]}"`);
        }
    }
    if (options.update) {
        command.push('--update');
    }
    if (options.noSearch) {
        command.push('--skip-search');
    }
    if (options.skipLastStep) {
        command.push('--sls');
    }
    return command.join(' ');
};

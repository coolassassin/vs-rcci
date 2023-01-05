type FileOption = {
    name: string;
    description: string;
};

export type TemplateDescription = { name: string; file?: string | FileOption[]; optional?: boolean; default?: boolean };

type TemplateDescriptionObject = {
    [key in string]: TemplateDescription;
};

export type MultiTemplate = {
    name: string;
    folderPath?: string;
    files: TemplateDescriptionObject;
}[];

export type TypingCases = 'camelCase' | 'PascalCase' | 'snake_case' | 'dash-case';
export type ProcessFileAndFolderName = ((name?: string, parts?: string[], isFolder?: boolean) => string) | TypingCases;

type AfterCreationCommand = {
    extensions?: string[];
    cmd: string;
};

export type Config = {
    multiProject: boolean;
    skipFinalStep: boolean;
    folderPath: string | string[];
    templatesFolder: string;
    templates: TemplateDescriptionObject | MultiTemplate;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    placeholders: { [key in string]: (data: any) => string };
    processFileAndFolderName?: ProcessFileAndFolderName;
    afterCreation?: {
        [key in string]: AfterCreationCommand;
    };
};

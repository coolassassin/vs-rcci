import { TypingCases, ProcessFileAndFolderName } from './types';

const capitalizeName = (value: string) => value.replace(/^./g, value[0].toUpperCase());

const getObjectNameParts = (name: string): string[] => {
    return name
        .replace(/(\d\D|\D\d)/g, (str) => `${str[0]}-${str[1]}`)
        .replace(/([A-Z])/g, '-$1')
        .replace(/[^a-zA-Z0-9]/g, '-')
        .split('-')
        .filter((l) => l);
};

export const mapNameToCase = (name: string, mapCase: TypingCases): string => {
    const lowerCaseParts = getObjectNameParts(name).map((part) => part.toLocaleLowerCase());

    switch (mapCase) {
        case 'camelCase':
            return lowerCaseParts.map((part, index) => (index === 0 ? part : capitalizeName(part))).join('');
        case 'PascalCase':
            return lowerCaseParts.map(capitalizeName).join('');
        case 'dash-case':
            return lowerCaseParts.join('-');
        case 'snake_case':
            return lowerCaseParts.join('_');
    }
};

export const getComponentFileName = (comonentName: string, processor: ProcessFileAndFolderName): string => {
    if (typeof processor === 'function') {
        return processor(comonentName, getObjectNameParts(comonentName), false);
    }

    return mapNameToCase(comonentName, processor);
};

import { execute } from './execute';
import * as fs from 'fs';
import * as path from 'path';

const packageName = 'reactcci';

const findClosestWithFiles = async (from: string, files: Array<string>): Promise<string | null> => {
    const check = files.some((file) => fs.existsSync(path.resolve(from, file)));
    if (check) {
        return from;
    }
    const upperFolder = path.resolve(from, '../');
    if (path.resolve(from) === upperFolder) {
        return null;
    }

    return findClosestWithFiles(upperFolder, files);
};

export const findPackage = async (searchPath: string): Promise<boolean> => {
    const closestLock = await findClosestWithFiles(searchPath, ['yarn.lock', 'package-lock.json', 'pnpm-lock.yaml']);

    if (closestLock === null) {
        return false;
    }

    if (fs.existsSync(path.resolve(closestLock, 'node_modules', packageName))) {
        return true;
    }

    const isYarn = fs.existsSync(path.resolve(closestLock, 'yarn.lock'));

    if (isYarn) {
        try {
            //check old yarn
            const yarnListResult = await execute(`yarn list --pattern=${packageName}`, closestLock);
            if (yarnListResult.includes(`${packageName}@`)) {
                return true;
            }
        } catch {}

        try {
            //check new yarn
            const yarnListResult = await execute(`yarn info ${packageName} --name-only --json`, closestLock);
            if (yarnListResult.includes(`${packageName}@`)) {
                return true;
            }
        } catch {}
    } else {
        try {
            const npmListResult = JSON.parse(await execute(`npm list ${packageName} --json`, closestLock));
            if (npmListResult.dependencies[packageName].version) {
                return true;
            }
        } catch {}
    }

    return false;
};

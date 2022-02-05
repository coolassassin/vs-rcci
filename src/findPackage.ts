import { execute } from './execute';
import * as fs from 'fs';
import * as path from 'path';

const packageName = 'reactcci';

export const findPackage = async (searchPath: string): Promise<boolean> => {
    if (fs.existsSync(path.resolve(searchPath, 'node_modules', packageName))) {
        return true;
    }

    const isYarn = fs.existsSync(path.resolve(searchPath, 'yarn.lock'));

    if (isYarn) {
        try {
            //check old yarn
            const yarnListResult = await execute(`yarn list --pattern=${packageName}`, searchPath);
            if (yarnListResult.includes(`${packageName}@`)) {
                return true;
            }
        } catch {}

        try {
            //check new yarn
            const yarnListResult = await execute(`yarn info ${packageName} --name-only --json`, searchPath);
            if (yarnListResult.includes(`${packageName}@`)) {
                return true;
            }
        } catch {}
    } else {
        try {
            const npmListResult = JSON.parse(await execute(`npm list ${packageName} --json`, searchPath));
            if (npmListResult.dependencies[packageName].version) {
                return true;
            }
        } catch {}
    }

    return false;
};

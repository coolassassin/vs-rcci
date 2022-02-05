import * as childProcess from 'child_process';

const ioEncodingOptions = { encoding: 'utf8' as BufferEncoding };

export const execute = (command: string, workingDirectory: string): Promise<string> =>
    new Promise((resolve, reject) =>
        childProcess.exec(
            command,
            { cwd: workingDirectory, ...ioEncodingOptions },
            (error: Error | null, stdout: string) => {
                if (error) {
                    reject(error);
                } else {
                    console.log(command, '\n', stdout.trim());
                    resolve(stdout.trim());
                }
            }
        )
    );

import * as vscode from 'vscode';
import { getRoot } from './helpers';

let firstRun = true;
let id: vscode.Terminal['processId'];
let terminal: vscode.Terminal | null = null;

export const runInTerminal = async (command: string) => {
    if (!terminal || !vscode.window.terminals.some(t => t.processId === id)) {
        terminal = vscode.window.createTerminal('reactcci');
        id = terminal.processId;
        firstRun = true;
    }

    if (firstRun) {
        terminal.sendText(`cd ${getRoot()}`, true);
    } else {
        terminal.sendText("\u0003Y\u000D", true);
        await new Promise(resolve => setTimeout(resolve, 100));
        vscode.commands.executeCommand('workbench.action.terminal.clear');
    }

    firstRun = false;
    terminal.sendText(command);
    terminal.show();
};
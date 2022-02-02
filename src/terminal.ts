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

    terminal.show();
    if (firstRun) {
        terminal.sendText(`cd ${getRoot()}`, true);
    } else {
        
        terminal.sendText("\u0003", true);
        vscode.commands.executeCommand('workbench.action.terminal.clear');
        await new Promise(resolve => setTimeout(resolve, 200));
        vscode.commands.executeCommand('workbench.action.terminal.clear');
    }

    firstRun = false;
    terminal.sendText(command);
};
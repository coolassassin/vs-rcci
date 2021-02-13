import * as vscode from 'vscode';

let firstRun = true;
let id: vscode.Terminal['processId'];
let terminal: vscode.Terminal | null = null;

export const runInTerminal = async (command: string) => {
    if (!terminal || !vscode.window.terminals.some(t => t.processId === id)) {
        terminal = vscode.window.createTerminal('reactcci');
        id = terminal.processId;
        firstRun = true;
    }

    if (!firstRun) {
        terminal.sendText("\u0003Y\u000D", true);
        terminal.sendText("cls", true);
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    firstRun = false;
    terminal.sendText(command);
    terminal.show();
};
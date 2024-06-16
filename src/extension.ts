import * as vscode from 'vscode';
import { exec } from 'child_process';
import { TextEdit, FormattingOptions } from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  const formatter = new IdeaFormatter();
  const disposable = vscode.languages.registerDocumentFormattingEditProvider('java', {
    provideDocumentFormattingEdits(document: vscode.TextDocument, options: FormattingOptions, token: vscode.CancellationToken): Thenable<TextEdit[]> {
      return formatter.formatDocument(document);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}

class IdeaFormatter {
  
  public formatDocument(document: vscode.TextDocument): Thenable<TextEdit[]> {
    const filePath = document.fileName;
    const ideaPath = vscode.workspace.getConfiguration().get<string>('ideaFormatter.path', 'idea64');
    const styleFilePath = this.getStyleFilePath();
    const command = `${ideaPath} format  -s ${styleFilePath} ${filePath}`;

    return new Promise((resolve, reject) => {
      exec(command, (err, stdout, stderr) => {
        if (err) {
          vscode.window.showErrorMessage(`Error: ${stderr}`);
          return reject(err);
        } else {
          vscode.window.showInformationMessage(`Formatted: ${filePath}`);
          resolve([TextEdit.replace(this.fullDocumentRange(document), document.getText())]);
        }
      });
    });
  }

  private getStyleFilePath(): string {
    const defaultStyleFilePath = path.join(__dirname, '../src/style.xml');
    const userStyleFilePath = vscode.workspace.getConfiguration().get<string>('ideaFormatter.styleFile');
    return userStyleFilePath ? userStyleFilePath : defaultStyleFilePath;
  }

  private fullDocumentRange(document: vscode.TextDocument): vscode.Range {
    const start = new vscode.Position(0, 0);
    const end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
    return new vscode.Range(start, end);
  }
}

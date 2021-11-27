import * as vscode from "vscode";

function getLinkMeRegex() {
  const prefix = vscode.workspace
    .getConfiguration("linkme")
    .get("generatedPrefix");
  const length = vscode.workspace
    .getConfiguration("linkme")
    .get("generatedHexLength");
  return new RegExp(`\\b${prefix}[0-9a-f]{${length}}\\b`, "g");
}

function updateDecorations(editor: vscode.TextEditor) {
  const decorationType = vscode.window.createTextEditorDecorationType({
    color: vscode.workspace.getConfiguration("linkme").get("decorationColor"),
    fontStyle: "italic",
    fontWeight: "bold",
  });

  const text = editor.document.getText();

  const linkMeRegex = getLinkMeRegex();
  const ranges: vscode.DecorationOptions[] = [];
  let match: RegExpExecArray | null;
  while ((match = linkMeRegex.exec(text))) {
    let startPos = editor.document.positionAt(match.index);
    let endPos = editor.document.positionAt(match.index + match[0].length);

    const copyCommand = vscode.Uri.parse(
      `command:linkme.copy?${encodeURIComponent(JSON.stringify([match[0]]))}`
    );
    const searchCommand = vscode.Uri.parse(
      `command:search.action.openNewEditor?${encodeURIComponent(
        JSON.stringify([{ query: match[0] }])
      )}`
    );
    const hoverMessage = new vscode.MarkdownString(
      `[copy](${copyCommand}) - [search](${searchCommand})`
    );
    hoverMessage.isTrusted = true;
    ranges.push({
      range: new vscode.Range(startPos, endPos),
      hoverMessage,
    });
  }

  editor.setDecorations(decorationType, ranges);
}

// throttle updates to the decorations
const timeoutMap = new WeakMap<vscode.TextEditor, NodeJS.Timeout>();
function queueDecorationUpdate(editor: vscode.TextEditor) {
  const timeout = timeoutMap.get(editor);
  if (timeout) {
    clearTimeout(timeout);
  }
  timeoutMap.set(
    editor,
    setTimeout(() => updateDecorations(editor), 100)
  );
}

export function registerDecorations(context: vscode.ExtensionContext) {
  // handle changes in the active text editor
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        queueDecorationUpdate(editor);
      }
    },
    null,
    context.subscriptions
  );

  // handle changes in any visible text editor
  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      const editor = vscode.window.visibleTextEditors.find(
        (visibleEditor) =>
          visibleEditor.document.fileName === event.document.fileName
      );
      if (editor) {
        queueDecorationUpdate(editor);
      }
    },
    null,
    context.subscriptions
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("linkme.copy", (text) => {
      if (text.match(getLinkMeRegex())) {
        vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage(`Copied ${text} to clipboard`);
      }
    })
  );
}

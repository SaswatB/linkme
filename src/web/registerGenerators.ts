import * as vscode from "vscode";

function genHexString(len: number) {
  let output = "";
  for (let i = 0; i < len; ++i) {
    output += Math.floor(Math.random() * 16).toString(16);
  }
  return output;
}

const insertGeneratedCode = (
  editor: vscode.TextEditor,
  edit: vscode.TextEditorEdit
) => {
  const prefix = vscode.workspace
    .getConfiguration("linkme")
    .get("generatedPrefix");
  const randomHex = genHexString(
    vscode.workspace.getConfiguration("linkme").get("generatedHexLength", 10)
  );
  edit.insert(editor.selection.start, `${prefix}${randomHex} `);
};

export function registerGenerators(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "linkme.generateCode",
      insertGeneratedCode
    )
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "linkme.generateCodeComment",
      async function (editor) {
        await vscode.commands.executeCommand("editor.action.insertLineBefore");
        await vscode.commands.executeCommand("editor.action.commentLine");
        editor.edit((edit) => insertGeneratedCode(editor, edit));
      }
    )
  );
}

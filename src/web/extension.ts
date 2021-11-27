import * as vscode from "vscode";
import { registerDecorations } from "./registerDecorations";
import { registerGenerators } from "./registerGenerators";

export function activate(context: vscode.ExtensionContext) {
  registerDecorations(context);
  registerGenerators(context);
}

export function deactivate() {}

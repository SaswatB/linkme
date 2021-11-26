import * as vscode from "vscode";
import { registerGenerators } from "./registerGenerators";

export function activate(context: vscode.ExtensionContext) {
  registerGenerators(context);
}

export function deactivate() {}

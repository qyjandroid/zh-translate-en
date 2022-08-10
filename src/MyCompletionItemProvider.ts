import * as vscode from "vscode";

export default class MyCompletionItemProvider implements vscode.CompletionItemProvider{
    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext){
        const list:vscode.CompletionItem[]=[];

        list.push(new vscode.CompletionItem({label:"哈哈",detail:"详情",description:"描述"},vscode.CompletionItemKind.Issue));
        list.push(new vscode.CompletionItem({label:"冲冲冲",detail:"详情2",description:"描述2"},vscode.CompletionItemKind.Issue));

        return list;

    }

}
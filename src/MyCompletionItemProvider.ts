import * as vscode from "vscode";
import transUtils from "./transUtils";
const {getTransResult}=transUtils;

export default class MyCompletionItemProvider implements vscode.CompletionItemProvider{
    public async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext){

        const content = document
        .getText(document.getWordRangeAtPosition(position));
        if(content && content.length>50){
            return;
        }
        const transResult = await getTransResult(content);
        const list:vscode.CompletionItem[]=[];
        console.log("提示结果===",transResult);
        if (transResult.errCode === 0) {
                    const transResultData=transResult.data;
                    let str = `原词-${transResultData.original}`;

                    if (transResultData.yd) {
                         list.push(new vscode.CompletionItem({label:`${transResultData.yd}`,detail:"有道",description:str},vscode.CompletionItemKind.Issue));
                    }

                    if (transResultData.cy) {
                        list.push(new vscode.CompletionItem({label:`${transResultData.cy}`,detail:"彩云",description:str},vscode.CompletionItemKind.Issue));
                    }

                    if (transResultData.bd) {
                        list.push(new vscode.CompletionItem({label:`${transResultData.bd}`,detail:"百度",description:str},vscode.CompletionItemKind.Issue));
                    }
         
        }
        console.log("获取的list的长度==",list.length);
        console.log("获取的list==",list);

        return list;

    }

}
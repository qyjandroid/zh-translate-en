// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ydTrans, bdTrans,initYDTrans } from "./ydtran";

async function startTrans(words: string) {
    const s = (new Date).getTime();
    const result = await ydTrans(words, s);
    return result;
}

function isZH(str: string) {
    const reg = /^[\u4E00-\u9FA5]+$/g;
    if (!reg.test(str)) {
        return false;
    } else {
        return true;
    }
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


    //获取配置
    const appId = vscode.workspace.getConfiguration().get("zh-translate-en.appId");
    //获取秘钥
    const key = vscode.workspace.getConfiguration().get("zh-translate-en.key");
    if(appId && key){
        //初始化词典
        initYDTrans(appId as string,key as string);
    }

    context.subscriptions.push(vscode.languages.registerHoverProvider({
        pattern: '**',
    }, {
        provideHover: async (document: vscode.TextDocument, position: vscode.Position) => {
            if (true) {
                const content = document.getText(document.getWordRangeAtPosition(position)).trim();
                let curText = content.replace(/[\r\n\s]+/g, '');
                if (curText.length > 0 && isZH(curText)) {
                    const result = await startTrans(curText);
                    const baiduResult = await bdTrans(curText);
                    if(result && baiduResult){
                        return new vscode.Hover(`[原词]：${result.query}，\n [有道结果]：${result.resultData}，[百度结果]：${baiduResult.resultData}`);
                    }else if(result){
                        return new vscode.Hover(`[原词]：${result.query}，\n [有道结果]：${result.resultData}，`);
                    }else if(baiduResult){
                        return new vscode.Hover(`[原词]：${baiduResult.query}，\n [百度结果]：${baiduResult.resultData}，`);
                    }else{
                        return new vscode.Hover(`翻译失败`);
                    }
                }

            }
        }
    }));
}

// this method is called when your extension is deactivated
export function deactivate() { }







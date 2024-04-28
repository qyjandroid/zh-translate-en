// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import {  initYDTrans, initBDTrans,initCaiYunToken } from "./ydtran";
import MyCompletionItemProvider from './MyCompletionItemProvider';
import transUtils from "./transUtils";

const {getTransResult,transCopy,enTransZh,transReplace, setBaiduEngineFlag,setCaiyunEngineFlag,setYoudaoEngineFlag,isZH}=transUtils;

interface TransResultData {
    original: string;
    yd?: string;
    bd?: string;
    google?:string;
}


function updateConfig(){
     //获取配置
     const appId = vscode.workspace
     .getConfiguration()
     .get("zh-translate-en.appId");
    //获取秘钥
    const key = vscode.workspace.getConfiguration().get("zh-translate-en.key","");

    const caiyunEngineFlag =vscode.workspace.getConfiguration().get("zh-translate-en.caiyun",false);
   const baiduEngineFlag =vscode.workspace.getConfiguration().get("zh-translate-en.baidu",true);
   const youdaoEngineFlag =vscode.workspace.getConfiguration().get("zh-translate-en.youdao",false);

    setBaiduEngineFlag(baiduEngineFlag);
    setCaiyunEngineFlag(caiyunEngineFlag);
    setYoudaoEngineFlag(youdaoEngineFlag);

    //获取百度配置
    const userBaiduAppId = vscode.workspace
    .getConfiguration()
    .get("zh-translate-en.baiduAppId","");
    //获取百度秘钥
    const userBaiduKey = vscode.workspace.getConfiguration().get("zh-translate-en.baiduKey","");

    const userCaiyunToken = vscode.workspace
    .getConfiguration()
    .get("zh-translate-en.caiyunToken","");
    
    if(userBaiduAppId && userBaiduKey){
        initBDTrans(userBaiduAppId as string,userBaiduKey as string);
    }

    if (appId && key) {
        //初始化词典
        initYDTrans(appId as string, key as string);
    }

    if(userCaiyunToken){
        initCaiYunToken(userCaiyunToken);
    }
}



// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    updateConfig();
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right
    );
    statusBarItem.text = "翻译插件success";
    statusBarItem.show();
   
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            {
                pattern: "**",
            },
            {
                provideHover: async (
                    document: vscode.TextDocument,
                    position: vscode.Position
                ) => {
                    if (true) {
                        const content = document
                            .getText(document.getWordRangeAtPosition(position));

                       
                        if(content && content.length>50){
                            return;
                        }
                        if(!isZH(content.trim())){
                            return;
                        }
                        const transResult = await getTransResult(content);
                        if (transResult.errCode === 0) {
                            const transResultData=transResult.data;
                            let str = `### [原词]：${transResultData.original}`;

                            if (transResultData.yd) {
                                str += `
> * [有道结果]：${transResultData.yd}`;
                            }
                            if (transResultData.cy) {
                                str += `
> * [彩云结果]：${transResultData.cy}`;
                            }

                            if (transResultData.bd) {
                                str += `
> * [百度结果]：${transResultData.bd}`;
                            }
                            return new vscode.Hover(str);
                        } else if(transResult.errCode=== -200){
                            statusBarItem.text = "翻译失败";
                            return new vscode.Hover(`翻译失败`);
                        }else if(transResult.errCode === -2){
                            statusBarItem.text = "翻译中";
                        }else{
                            statusBarItem.text = "等待翻译";
                        }
                    }
                },
            }
        )
    );


    // const provider = vscode.languages.registerCompletionItemProvider(
    //     {
    //         pattern: "**",
    //         scheme:'file'
    //     },new MyCompletionItemProvider(),".");

    // context.subscriptions.push(provider);

    //翻译并替换
    let disposable = vscode.commands.registerCommand(
        "zh-en.transReplace",
        () => {
            transReplace(statusBarItem);
        }
    );
    context.subscriptions.push(disposable);

    //翻译并复制
    let transCopyDisposable = vscode.commands.registerCommand(
        "zh-en.transCopy",
        () => {
            transCopy(statusBarItem);
        }
    );
    context.subscriptions.push(transCopyDisposable);


    let enToZh = vscode.commands.registerCommand(
        "en-zh",
        () => {
            enTransZh(statusBarItem);
        }
    );
    context.subscriptions.push(enToZh);



    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(
        e => {
            updateConfig();
        }
      ));
}

// this method is called when your extension is deactivated
export function deactivate() { }

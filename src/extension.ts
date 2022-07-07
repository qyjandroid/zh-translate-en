// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ydTrans, bdTrans, initYDTrans, initBDTrans } from "./ydtran";
const fs = require("fs");
const exec = require("child_process").exec;
const iconv = require("iconv-lite");

interface TransResultData {
    original: string;
    yd?: string;
    bd?: string;
}

let curTransResult = null as any;

async function startTrans(words: string) {
    const s = new Date().getTime();
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

function copyToClipboardFun(content: string, statusBarItem: any) {
    try {
        statusBarItem.text = "复制中...";
        content = iconv.encode(content, "gbk");
        let resultFileName = "result.txt";
        let command = `clip < ${resultFileName} `;
        fs.writeFileSync(resultFileName, content);

        var cmdFileName = "copy.bat";
        fs.writeFileSync(cmdFileName, command);
        exec(cmdFileName, function (err: any, stdout: any, stderr: any) {
            if (err || stderr) {
                console.log(err, stdout, stderr);
                statusBarItem.text = "复制失败";
                return;
            }
            fs.unlinkSync(cmdFileName);
            fs.unlinkSync(resultFileName);
            statusBarItem.text = "复制到剪切板";
        });
    } catch (e) {
        statusBarItem.text = "复制到失败";
    }
}

/**
 * 智能挑选最佳结果
 * @param str
 * @returns
 */
function getBestTrans(str: string) {
    if (str && typeof str === "string") {
        const array = str.split(",");
        let resultMap = {} as any;
        //遍历结果
        for (let i = 0; i < array.length; i++) {
            const itemStr = array[i];
            if (itemStr && itemStr.trim()) {
                const item = itemStr.toLocaleLowerCase();
                if (resultMap[item]) {
                    resultMap[item] = resultMap[item] + 1;
                } else {
                    resultMap[item] = 1;
                }
            }
        }
        console.log("resultMap=",resultMap);

        let bestResult = {
            key: "",
            value: 1,
        };

        const resultKey = Object.keys(resultMap);
        for (let j = 0; j < resultKey.length; j++) {
            const key = resultKey[j];
            const value = resultMap[key];
            if (value > bestResult.value) {
                bestResult = {
                    key,
                    value,
                };
            }
        }

        console.log("bestResult=",bestResult);
        if (bestResult.value > 1) {
            return bestResult.key;
        }

        return str;
    }
    return "";
}

/**
 * 获取翻译结果
 * @param text
 * @returns
 */
async function getTransResult(text: string) {
    const content = text.trim();
    let curText = content.replace(/[\r\n\s]+/g, "");

    if (curText.length > 0 && isZH(curText)) {
        //做一层结果缓存
        if (curTransResult && curTransResult.original === curText) {
            console.log("直接使用结果数据");
            return curTransResult;
        }
        const result = await startTrans(curText);
        const baiduResult = await bdTrans(curText);
        if (result && baiduResult) {
            curTransResult = {
                original: result.query,
                yd: result.resultData,
                bd: baiduResult.resultData,
            };
        } else if (result) {
            curTransResult = {
                original: result.query,
                yd: result.resultData,
            };
        } else if (baiduResult) {
            curTransResult = {
                original: baiduResult.query,
                bd: baiduResult.resultData,
            };
        } else {
            curTransResult = null;
        }
        return curTransResult;
    }
}

/**
 * 
 * 获取文本字符串
 */
function getTransResultText(result: any) {
    const keys = Object.keys(result);
    let text = "";
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key !== "original") {
            text += result[key] + ",";
        }
    }
    return text;
}

async function transReplace(statusBarItem:any) {
    try {
        statusBarItem.text = "替换开始...";
        // 获取当前打开的文件的editor
        const editor = vscode.window.activeTextEditor;
        // editor === undefined 表示没有打开的文件
        if (!editor) {
            return;
        }
        // 当前被选中文本的位置信息数组（实际上就是range组成的数组）
        const section = editor.selection;
        const originalText = editor.document.getText(section);
        const transResult = await getTransResult(originalText);
        let replaceText = "";
        if (transResult) {
            const transText = getTransResultText(transResult);
            replaceText = getBestTrans(transText);
        }
        editor.edit((editBuilder) => {
            editBuilder.replace(section, replaceText);
            statusBarItem.text = `替换成功`;
        });
    } catch (e) {
        console.log("替换异常==", e);
        statusBarItem.text = `查询异常`;
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    //获取配置
    const appId = vscode.workspace
        .getConfiguration()
        .get("zh-translate-en.appId");
    //获取秘钥
    const key = vscode.workspace.getConfiguration().get("zh-translate-en.key");

    //获取百度配置
    const userBaiduAppId = vscode.workspace
    .getConfiguration()
    .get("zh-translate-en.baiduAppId")+"";
    //获取百度秘钥
    const userBaiduKey = vscode.workspace.getConfiguration().get("zh-translate-en.baiduKey")+"";

    if(userBaiduAppId && userBaiduKey){
        initBDTrans(userBaiduAppId as string,userBaiduKey as string);
    }

    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right
    );
    statusBarItem.text = "翻译插件success";
    statusBarItem.show();
    if (appId && key) {
        //初始化词典
        initYDTrans(appId as string, key as string);
    }

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
                        const transResult: TransResultData = await getTransResult(content);
                        if (transResult) {
                            const transText = getTransResultText(transResult);
                            copyToClipboardFun(transText, statusBarItem);
                            let str = `[原词]：${transResult.original},\n`;
                            if (transResult.yd) {
                                str += `[有道结果]：${transResult.yd},`;
                            }

                            if (transResult.bd) {
                                str += `[百度结果]：${transResult.bd}`;
                            }
                            return new vscode.Hover(str);
                        } else {
                            statusBarItem.text = "翻译失败";
                            return new vscode.Hover(`翻译失败`);
                        }
                    }
                },
            }
        )
    );

    let disposable = vscode.commands.registerCommand(
        "zh-en.transReplace",
        () => {
            transReplace(statusBarItem);
        }
    );
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }

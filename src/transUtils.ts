import * as vscode from "vscode";
import { ydTrans, bdTrans, caiyunTrans } from "./ydtran";

let curTransResult = {errCode:-1,data:null as any};
//翻译状态
let transLoading= 0;


let baiduEngineFlag =true;
let youdaoEngineFlag =false;
let caiyunEngineFlag =false;



function setBaiduEngineFlag(flag:boolean){
    baiduEngineFlag=flag;
}
function setYoudaoEngineFlag(flag:boolean){
    youdaoEngineFlag=flag;
}
function setCaiyunEngineFlag(flag:boolean){
    caiyunEngineFlag=flag;
}

function getBaiduEngineFlag(){
   return baiduEngineFlag;
}
function getYoudaoEngineFlag(){
   return youdaoEngineFlag;
}
function getCaiyunEngineFlag(){
   return caiyunEngineFlag;
}



async function startTrans(words: string) {
    const s = new Date().getTime();
    const result = await ydTrans(words, s);
    return result;
}

function isZH(str: string) {
    const reg = /^[\u4E00-\u9FA5]+$/g;
    if (!reg.test(str)) {
        return false;
    } 
    return true;
}

async function copyToClipboardFun(content: string, statusBarItem: any) {
    try{
        statusBarItem.text = "复制中...";
        await vscode.env.clipboard.writeText(content);
        statusBarItem.text = "复制成功";
    }catch(e){
        statusBarItem.text = "复制失败";
        vscode.window.showErrorMessage(`复制失败:${e}`);
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
    const curText = text.trim();
    if (curText.length > 0 && isZH(curText)) {
        console.log("翻译的英文:",curText);
        //做一层结果缓存
        if (curTransResult.errCode===0 && curTransResult.data.original === curText) {
            return curTransResult;
        }
        if(transLoading!==0){
            return {
                errCode:-2, //翻译中
                data:null
            };
        }
        transLoading=1;

        const caiyunResult = caiyunEngineFlag? await caiyunTrans(curText):null;
        const result =youdaoEngineFlag? await startTrans(curText):null;
        const baiduResult =baiduEngineFlag? await bdTrans(curText):null;
        if (result || baiduResult ) {
            curTransResult = {
                errCode:0,
                data:{
                    original: curText,
                    bd: baiduResult?.resultData,
                    yd:result?.resultData,
                    cy: caiyunResult?.resultData
                }
            };
        }  else {
            curTransResult = {
                errCode:-200,
                data:null
            };
        }
    }else{
        curTransResult={errCode:-1,data:null};
    }
    //翻译结束
    transLoading=0;
    return curTransResult;
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
        if (key !== "original" && result[key]) {
            text += result[key] + ",";
        }
    }
    if(text.length>0){
        text = text.substring(0,text.length-1);
    }
    return text;
}

async function transReplace(statusBarItem:any) {
    console.log("调用替换");
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
        if (transResult.errCode === 0) {
            const transText = getTransResultText(transResult.data);
            replaceText = getBestTrans(transText);
        }
        editor.edit((editBuilder) => {
            editBuilder.replace(section, replaceText);
            statusBarItem.text = `替换成功`;
        });
    } catch (e) {
        console.log("替换异常==", e);
        statusBarItem.text = `替换异常`;
        vscode.window.showErrorMessage(`替换异常:${e}`);
    }
}

async function transCopy(statusBarItem:any) {
    try {
        statusBarItem.text = "网络翻译中...";
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
  
        if (transResult.errCode === 0) {
            const transResultData=transResult.data;
            const transText = getTransResultText(transResultData);
            await copyToClipboardFun(transText, statusBarItem);
        }else{
            statusBarItem.text = "翻译失败...";
        }
        
    } catch (e) {
        statusBarItem.text = `翻译异常`;
        vscode.window.showErrorMessage(`翻译异常:${e}`);
    }
}


export default {
    getTransResult:getTransResult,
    transReplace: transReplace,
    transCopy:transCopy,
    setBaiduEngineFlag,
    setCaiyunEngineFlag,
    setYoudaoEngineFlag,
    getBaiduEngineFlag,
    getYoudaoEngineFlag,
    getCaiyunEngineFlag
};
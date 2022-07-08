import MD5 from "./md5";
const CryptoJS = require("crypto-js");
const rp = require('request-promise');



var ydAppId="",ydAppKey="",baiduAppId="20200619000500482",baiduKey="2b3sWLVzytlIWz6jSuZq";

/**
 * 
 * 初始化有道词典
 * @export
 * @param {string} appId 
 * @param {string} key 
 */
export function initYDTrans(appId:string,key:string){
    ydAppId=appId,
    ydAppKey=key;
}
/**
 * 
 * 初始化百度词典
 * @export
 * @param {string} appId 
 * @param {string} key 
 */
export function initBDTrans(appId:string,key:string){
    baiduAppId=appId || baiduAppId,
    baiduKey=key || baiduKey;
}

export async function ydTrans(query: string, signCode: number) {
    // var appKey = '1d325fe725dcbf33';
    // var key = 'QTcG2KlRc6NdMlp7MXtkRMGS6mWrZfJV';//注意：暴露appSecret，有被盗用造成损失的风险
    var appKey= ydAppId;
    var key= ydAppKey;
    if(!appKey || !key){
        return null;
    }
    var salt = (new Date).getTime();
    var curtime = Math.round(new Date().getTime() / 1000);
    // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    var from = 'zh-CHS';
    var to = 'en';
    var str1 = appKey + truncate(query) + salt + curtime + key;
    var vocabId = '您的用户词表ID';
    //console.log('---',str1);

    var sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);


    const options = {
        q: query,
        appKey: appKey,
        salt: salt,
        from: from,
        to: to,
        sign: sign,
        signType: "v3",
        curtime: curtime,
        vocabId: vocabId,
    };

    const api = "https://openapi.youdao.com/api";
    const endpoint = api + '?' + transData(options);

    const data = await rp(endpoint, { json: true,timeout:1500 });

    if (data == null) {
        return null;
    }
    if (data.errorCode != 0) {
        return null;
    }
    let resultData = "";
    if (data.basic == null) {
        if (data.translation == null) {
            return null;
        }
        resultData = data.translation;
    }
    else {
        if (data.translation != null) {
            resultData = mergeYDData(data.basic.explains, data.translation).join(",");
        }
        else {
            resultData = data.basic.explains;
        }
    }
    return { resultData, query, signCode };

}

function transData(data: any) {
    let body = "";
    const keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
        body += `${keys[i]}=${encodeURIComponent(data[keys[i]])}`;
        if (i < keys.length - 1) {
            body += "&";
        }
    }
    return body;
}

function mergeYDData(arrData1: any, arrData2: any) {
    for (let i = 0; i < arrData2.length; i++) {
        let item = arrData2[i];
        if (arrData1.indexOf(item) >= 0) {
            continue;
        }
        arrData1.push(item);
    }
    return arrData1;
}

function truncate(q: any) {
    var len = q.length;
    if (len <= 20) return q;
    return q.substring(0, 10) + len + q.substring(len - 10, len);
}


export async function bdTrans(query: any) {
    var appid = baiduAppId;
    var key = baiduKey;
    var salt = (new Date).getTime();
    //var query = 'apple';
    // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    var from = 'zh';
    var to = 'en';
    var str1 = appid + query + salt + key;
    var sign = MD5(str1);

    const options = {
        q: query,
        appid: appid,
        salt: salt,
        from: from,
        to: to,
        sign: sign
    };

    const api = "http://api.fanyi.baidu.com/api/trans/vip/translate";
    const endpoint = api + '?' + transData(options);

    const result = await rp(endpoint, { json: true, timeout:1500 });
    if (result.trans_result == null) {
        return null;
    }
    let resultData = result.trans_result || {};
    if (resultData instanceof Array && resultData[0]) {
        return {query:resultData[0].src,resultData:resultData[0].dst};
    }
    return {query:resultData.src,resultData:resultData.dst};
}


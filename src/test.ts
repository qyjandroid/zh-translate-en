import { ydTrans, bdTrans } from "./ydtran";

async function startTrans(words: string) {
    const s = (new Date).getTime();
    const result = await ydTrans(words, s);
    return result;
}


bdTrans("排行榜").then((res)=>{
    console.log("res==",res);
}).catch((err)=>{
    console.log("err====",err);
})


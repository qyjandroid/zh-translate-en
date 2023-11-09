import { ydTrans, bdTrans } from "./ydtran";

async function startTrans(words: string) {
    const s = (new Date).getTime();
    const result = await ydTrans(words, s,"en");
    return result;
}

startTrans("排行榜").then((res)=>{
    console.log("startTransres==",res);
}).catch((err)=>{
    console.log("err====",err);
});

bdTrans("排行榜","en").then((res)=>{
    console.log("bdTransres==",res);
}).catch((err)=>{
    console.log("err====",err);
});



async function startTrans1() {
    const s = (new Date).getTime();
    const result = await ydTrans("hello", s,"zh");
    return result;
}



startTrans1().then((res)=>{
    console.log("startTrans1==",res);
}).catch((err)=>{
    console.log("err====",err);
});

bdTrans("hello","zh").then((res)=>{
    console.log("bdTransres==",res);
}).catch((err)=>{
    console.log("err====",err);
});
import { ydTrans } from "./ydtran";

class WordCounter {
    private vscode;
    private disposable: any;
    private editor: any;
    private timeout: any;
    constructor(_vscode: any) {        //构造函数，传入vscode对象
        this.vscode = _vscode;
        this.init();
    }

    init() {                      //初始化
        const vscode = this.vscode;
        //const StatusBarAlignment = vscode.StatusBarAlignment;
        const window = this.vscode.window;

        //statusBar，是需要手动释放的
        //this.statusBar = window.createStatusBarItem(StatusBarAlignment.Left);

        //跟注册事件相配合的数组，事件的注册，也是需要释放的
        let disposable: any[] = [];
        //事件在注册的时候，会自动填充一个回调的dispose到数组
        window.onDidChangeTextEditorSelection(this.updateText, this, disposable);

        //保存需要释放的资源
        this.disposable = vscode.Disposable.from(disposable);

        this.updateText();
        //this.statusBar.show();
    }

    updateText() {       //现在快凌晨两点，偷个懒早点睡，临时改成字符数量了。
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            const content = this.getSelectedText();
            if (content.length > 0) {
                //请求网络
                this.startTrans(content);
            }
        }, 1500);
    }


    getSelectedText = (): string => {
        const window = this.vscode.window;
        this.editor = window.activeTextEditor;
        if (this.editor) {
            const curSelectedText = this.editor.selection;
            let content = this.editor.document.getText(curSelectedText);
            content = content.replace(/[\r\n\s]+/g, '');
            if (content.length > 0) {
                return content;
            }
        }
        return "";
    };


    async startTrans(words: string) {
        const s = (new Date).getTime();
        const result = await ydTrans(words, s);
        return result;
    }


    cbTrans = (result: any, query: string, a: number) => {
        if (result instanceof Array) {
            this.vscode.window.showInformationMessage(`
            		${query}的结果：${result.join(",")}
            	`, { modal: true });

            // this.vscode.window.showQuickPick(
            //     [
            //         "哈哈哈，你是傻逼吗",
            //         "哈哈哈，你是二逼么",
            //         "你他妈有病吧",
            //         "乖，你是妈的智障"
            //     ],
            //     {
            //         canPickMany: true,
            //         ignoreFocusOut: true,
            //         matchOnDescription: true,
            //         matchOnDetail: true,
            //         placeHolder: '温馨提示，请选择你是哪种类型？'
            //     })
            //     .then(function (msg) {
            //         console.log(msg);
            //     });

        }
        console.log("t==", result, "==query=", query, "==time=", a);
    };


    dispose() {  //实现dispose方法
        this.disposable.dispose();
        //this.statusBar.dispose();
    }
}

module.exports = WordCounter;

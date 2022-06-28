# zh-translate-en
vscode 中文翻译英文插件

## 功能

由于采用鼠标悬停操作翻译，为避免多余翻译，造成没有必要的请求接口，故只翻译中文。英文悬停不翻译。

该插件只是帮助程序员命名。

本翻译软件默认为百度翻译，您也可以配置appId和密钥来增加有道翻译功能（在配置中设置即可）。

- 批量翻译识别出的命名：
![翻译](截图/7mV3JDx47k.gif)




## 使用有道云

- 注册账号：
https://ai.youdao.com/login.s

- 注册应用：
创建应用，应用名称随便写
![创建应用](截图/yd1.png)

- 选择开通功能：
选择文本翻译，然后选择使用方式为API
![选择开通功能](截图/yd2.png)
- 查看appId和密钥：
  ![查看appId和密钥](截图/yd3.png)
- 设置插件：
- 选择vscode 设置->扩展->zh-translate-en
 ![配置](截图/yd45.png)

附录：代码命名规范：例如：welfare
|         | 变量名          |           | 方法名  |        | 类名  |
|  ----   | ----           |  ----     | ----   |  ----  | ----  |
| 变量     | welfare        |函数名      | fnWelfare  |类名     | Welfare |
| 常量     | WELFARE        |get方法     | getWelfare  |基类     | BaseWelfare |
| 列表     | welfareList    |set方法      | setWelfare  |异常类     | AbstractWelfare|
| 数组     | arrayWelfare   |事件方法     | onWelfare  |实现类     | WelfareImpl |
| 字典     | welfareMap   |删除方法     | deleteWelfare  |枚举类     | WelfareEnum |
| 数据对象     | welfareDO   |更新方法     | updateWelfare  |接口     | IWelfare |
| 数据传输对象     | welfareDTO   |回调方法     | callbackWelfare  |控制器名     | WelfareController|
| 展示对象     | welfareVO   |异步方法     | asyncWelfare  |服务名     | WelfareService|


## 打包 & 发布
- npm run package
- https://marketplace.visualstudio.com/manage/publishers/quanyj
 ![推送插件](截图/push.png)








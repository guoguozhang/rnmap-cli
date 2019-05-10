# 使用场景
用bugly搜集rn项目的crash信息时，如果是js报错的话，定位到的是压缩处理后的代码位置，该脚本主要根据报错提供的行列号，定位到开发环境中的代码位置，方便修改bug。
# 安装使用

全局安装：
```
npm install rnmap-cli -g
```
切换到相应的rn项目下：


```
rnmap <row> <column> -c -a
```
参数说明：
- row: 报错行
- column: 报错列
- -c: 缓存映射文件，默认不缓存
- -a: 设置平台为android，默认iOS

# Coze TO GPT

## 简介

这是一个用于将 Coze API 转换为 ChatGPT API 的简单工具，完全基于 nodejs。

## 用法

### 服务器

1. 下载项目

2. 运行 `npm install && npm install nodemon -g`

3. 运行 `node server.js`(或者 `npm run start`)

### 客户端

#### 使用 ChatBox

1. 从[这里](https://chatboxai.app/zh#download)下载聊天框应用程序 

2. 在浏览器中打开 coze.com 

3. 创建帐户并登录 

4. 按下 `F12` 打开控制台 

5. 选择 `Application` 标签页 

6. 在左侧边栏中选择 `Cookies`  

7. 复制 `sessionid` 的值  

8. 打开聊天框应用程序并点击“设置”按钮  

9. 选择 OpenAI API 并粘贴到 “API Key” 输入中的 sessionid 值  

10. 在 “API URL” 输入中输入 http://localhost:3000   

11. 保存设置，然后开始使用



## 截图

![alt text](<CleanShot 2024-02-26 at 23.33.26.png>)

![alt text](<CleanShot 2024-02-26 at 23.35.23.png>)
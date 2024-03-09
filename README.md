# Coze TO GPT

## Notice

The official API of COZE will be released in *April*. For a better experience, please use the official API.

![alt text](assets/cleanshot03.png)

> [中文 README](README_zh-CN.md)

## Introduction
This is a simple tool to convert a Coze API to a ChatGPT API. Totaly based on nodejs.

## Usage

### Server
1. download the project
2. run `npm install && npm install nodemon -g`
3. run `node server.js`(OR `npm run start`)

### Client
#### By using the chatbox
1. download the chatbox app from [here](https://chatboxai.app/zh#download)
2. open coze.com in browser
3. create a account and login
4. press `F12` to open the console
5. select the `Application` tab
6. select the `Cookies` in the left sidebar
7. copy the `sessionid` value
8. open the chatbox app and click the `setting` button
9. choose the OpenAI API and paste the `sessionid` value to the `API Key` input
10. input the `http://localhost:3000` to the `API URL` input
11. save the setting and enjoy it

## Screenshot
![alt text](assets/cleanshot01.png)

![alt text](assets/cleanshot02.png)
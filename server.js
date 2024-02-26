import Koa from "koa";
import Router from "@koa/router";
import compose from "koa-compose";
import { koaBody } from "koa-body";
import {
  handleTimeStap,
  handleBase64,
  handleNewSession,
  handleErrors,
  initParams,
} from "./handles.js";
import https from "https";
import { createParser } from "eventsource-parser";
import fs from "fs";
const app = new Koa();
const router = new Router();
const params = {};

// 主页路由
router.get("/", async (ctx) => {
  const data = await fs.promises.readFile("index.html");
  ctx.type = "html";
  ctx.body = data;
});

// 事件源路由
router.post("/v1/chat/completions", async (ctx) => {
  ctx.respond = false;
  ctx.type = "text/event-stream";
  ctx.status = 200;
  // 初始化响应头 sse
  ctx.set({
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Content-Encoding": "none",
  });
  // 获取 post 请求的 body
  const { messages, model } = ctx.request.body;
  // 返回的数据
  const sseData = {
    id: null,
    object: "chat.completion.chunk",
    created: handleTimeStap(),
    model: model,
    system_fingerprint: null,
    choices: [
      {
        index: 0,
        delta: { content: null },
        logprobs: null,
        finish_reason: null,
      },
    ],
  };
  // 远程服务器配置
  const options = {
    hostname: "www.coze.com",
    path: "/api/conversation/chat",
    port: 443,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `sessionid=${ctx.req.headers.authorization.split(" ")[1]}`,
      "Content-Length": Buffer.byteLength(JSON.stringify(params)),
    },
  };
  params.query = messages[messages.length - 1].content;
  const sse = https.request(options);
  sse.on("response", async (res) => {
    const parser = createParser((event) => {
      if (event.event === "message") {
        const data = JSON.parse(event.data);
        if (data.message.type === "answer") {
          sseData.id = data.conversation_id;
          sseData.choices[0].delta.content = data.message.content;
          if (data.is_finish) {
            sseData.choices[0].finish_reason = "stop";
          } else {
            sseData.choices[0].finish_reason = null;
          }
          ctx.res.write(`data:${JSON.stringify(sseData)}\n\n`);
          if (data.is_finish) {
            ctx.res.end();
          }
        }
      }
    });
    res.setEncoding("utf8");
    console.log(`statusCode: ${res.statusCode}`);
    res.on("data", (d) => {
      parser.feed(d);
    });
    res.on("end", () => {
      console.log("No more data in response.");
    });
  });
  sse.on("error", async (e) => {
    console.error(`problem with request: ${e.message}`);
  });
  sse.on("close", async () => {
    if (
      messages[0].role === "system" &&
      messages[0].content.includes(
        "Name the conversation based on the chat records.\n"
      )
    ) {
      console.log("new session");
      const sessionid = ctx.req.headers.authorization.split(" ")[1];
      await handleNewSession(
        {
          conversation_id: params.conversation_id,
          scene: params.scene,
        },
        sessionid
      );
      params.conversation_id =
        "7337495393033765890_7337496580645339154_2_" + handleTimeStap();
      params.local_message_id = handleBase64();
    }
  });

  sse.write(JSON.stringify(params));
  sse.end();
  ctx.respond = false;
});

// 组合中间件
const all = compose([
  handleErrors,
  koaBody(),
  router.routes(),
  router.allowedMethods(),
]);

// 注册中间件
app.use(all);

// 启动Koa应用
app.listen(3000, () => {
  console.log("Server started on port 3000");
  initParams(params);
});

import Koa from "koa";
import Router from "@koa/router";
import compose from "koa-compose";
import { koaBody } from "koa-body";
import { handleTimeStap, handleBase64, handleNewSession } from "./handles.js";
import https from "https";
import { createParser } from "eventsource-parser";
import fs from "fs";
const app = new Koa();
const router = new Router();
const params = {};
let createTime = null;

// 全局异常处理
const handleErrors = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Error:", err.message);
    ctx.status
      ? (ctx.body = `${ctx.status} - ${ctx.message}`)
      : (ctx.body = "500 - Internal Server Error");
  }
};

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
  const { messages } = ctx.request.body;
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
  params.query = messages[messages.length - 1].content;
  const newData = {
    id: null,
    object: "chat.completion.chunk",
    created: null,
    model: "gpt-3.5-turbo-16k-0613",
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
  const sse = https.request(options);
  sse.on("response", async (res) => {
    const parser = createParser((event) => {
      if (event.event === "message") {
        const data = JSON.parse(event.data);
        if (data.message.type === "answer") {
          newData.id = data.conversation_id;
          newData.choices[0].delta.content = data.message.content;
          if (data.is_finish) {
            newData.choices[0].finish_reason = "stop";
          } else {
            newData.choices[0].finish_reason = null;
          }
          ctx.res.write(`data:${JSON.stringify(newData)}\n\n`);
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
  initParams();
});

const initParams = async () => {
  params.bot_id = "7337496580645339154";
  params.conversation_id =
    "7337495393033765890_7337496580645339154_2_" + handleTimeStap();
  params.local_message_id = handleBase64();
  params.query = "";
  params.bot_version = "1708713749830";
  params.chat_history = [];
  params.insert_history_message_list = [];
  params.stream = true;
  params.scene = 2;
  params.content_type = "text";
  params.extra = {};
};

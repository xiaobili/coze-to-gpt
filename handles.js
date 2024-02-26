/**
 * 获取时间戳
 * @returns {string} - timestamp
 */
const handleTimeStap = () => {
  return new Date().getTime();
};

/**
 * 生成随机字符串
 * @returns {string} - nonce
 *
 */
const handleBase64 = () => {
  const nonce = btoa(
    new Uint8Array(21).reduce(
      (data) => data + String.fromCharCode(Math.floor(Math.random() * 256)),
      ""
    )
  );
  return nonce.substring(0, 21);
};

/**
 * 全局异常处理
 * @param {*} ctx
 * @param {*} next
 */
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

const handleNewSession = async (params, sessionid) => {
  await fetch("https://www.coze.com/api/conversation/create_section", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `sessionid=${sessionid}`,
    },
    body: JSON.stringify(params),
    credentials: "include",
  });
};

const initParams = async (params) => {
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

export {
  handleTimeStap,
  handleBase64,
  handleNewSession,
  handleErrors,
  initParams,
};

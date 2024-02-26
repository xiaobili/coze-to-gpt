/**
 * 获取时间戳
 * @returns {string} - timestamp
 */
const handleTimeStap = () => {
  const timestamp = new Date().getTime();
  return timestamp;
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

export { handleTimeStap, handleBase64, handleNewSession };

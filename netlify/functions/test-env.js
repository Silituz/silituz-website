exports.handler = async () => {
  const repo = process.env.GH_REPO || "(missing)";
  const branch = process.env.GH_BRANCH || "(missing)";
  const hasToken = !!process.env.GH_TOKEN;
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ok:true, repo, branch, token_status: hasToken ? "OK (hidden)" : "MISSING" })
  };
};

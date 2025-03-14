const { Page } = require("playwright");

const getCurrentNavigation = async (page) => {
  let content = await page.locator("#curr").innerText();
  content = content?.trim();
  content = content?.replace("\n", "");
  content = content?.replace("\t", "");
  console.log(`当前导航: ${content}`);
  return content;
};

const assertCurrentNavigation = async (page, expect) => {
  const currentNavigation = await getCurrentNavigation(page);
  if (currentNavigation === expect) {
    return true;
  }
  throw new Error(`未能到达 [${expect}]，当前为 [${currentNavigation}]`);
};

module.exports = {
  getCurrentNavigation,
  assertCurrentNavigation,
};

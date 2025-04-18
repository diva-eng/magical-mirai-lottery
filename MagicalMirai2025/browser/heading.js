const { Page } = require("playwright");

const getCurrentHeading = async (page) => {
  let content = await page
    .locator(
      "#wrap > form > section:nth-child(1) > div > div.contents_title.red_lightpink_back > h2"
    )
    .innerText();
  content = content?.trim();
  content = content?.replace("\n", "");
  content = content?.replace("\t", "");
  return content;
};

const assertCurrentHeading = async (page, expect) => {
  const currentHeading = await getCurrentHeading(page);
  if (currentHeading === expect) {
    return true;
  }
  await page.screenshot({ path: `标题未能到达 [${expect}].png` });
  throw new Error(`未能到达 [${expect}]，得到 [${currentHeading}]`);
};

module.exports = {
  getCurrentHeading,
  assertCurrentHeading,
};

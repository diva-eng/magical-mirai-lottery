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

  throw new Error(`Failed to reach [${expect}] got [${currentHeading}]`);
};

module.exports = {
  getCurrentHeading,
  assertCurrentHeading,
};

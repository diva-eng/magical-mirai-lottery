const { Page } = require("playwright");

const selectShow = async (page, showNoOneBased) => {
  await page.evaluate((showNo) => {
    const zeroBased = showNo - 1;
    const elements = document.getElementsByName("hope_event_perf_cd");
    if (zeroBased < elements.length) {
      elements[zeroBased].click();
    }
  }, showNoOneBased);
};

//FOR SAFETY REASON
const selectSSSeat = async (page) => {
  await page.evaluate(() => {
    const elements = document.getElementsByName("hope_stk_stknd_cd");
    elements[0].click();
  });
};

module.exports = { selectShow, selectSSSeat };

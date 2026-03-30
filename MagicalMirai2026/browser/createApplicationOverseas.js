const chance = require("chance").Chance();
const {
  trimSummary,
  splitDate,
  delay,
  splitPhoneNumber,
  truncatePhoneNumber,
} = require("../utils");
const { selectShow, selectSSSeat } = require("./action");
const { getSlcd } = require("./element");
const { assertCurrentHeading, getCurrentHeading } = require("./heading");
const { assertCurrentNavigation, getCurrentNavigation } = require("./navigate");

const completeOverseaLottery = async (page, lottery, link, dryRun = false) => {
  const password = chance.string({ length: 6, alpha: false, numeric: true });
  await page.goto(link);
  await page.click("#wrap > form > section > div > input");
  await page.click("#upppd");
  await page.click("#speed_regist_enabled");

  await assertCurrentNavigation(page, "Application Input");
  await assertCurrentHeading(page, "Entry of your information input");

  await delay(1000);

  const slcd = await getSlcd(page);

  await page.fill(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(2) > dd > p > input[type=text]:nth-child(1)",
    lottery.firstName.trim()
  );
  await page.fill(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(2) > dd > p > input[type=text]:nth-child(2)",
    lottery.lastName.trim()
  );
  if (lottery.gender == "male") {
    await page.check(
      "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(3) > dd > p > input[type=radio]:nth-child(2)"
    );
  } else {
    await page.check(
      "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(3) > dd > p > input[type=radio]:nth-child(1)"
    );
  }
  await delay(1000);

  const { year, month, day } = splitDate(lottery.birthDate);
  await page.selectOption(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(4) > dd > p > select:nth-child(1)",
    { value: year }
  );
  await page.selectOption(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(4) > dd > p > select:nth-child(2)",
    { value: month }
  );
  await page.selectOption(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(4) > dd > p > select:nth-child(3)",
    { value: day }
  );

  const [first_three, middle_four, last_four] = splitPhoneNumber(lottery.phone);
  await page.fill(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(5) > dd:nth-child(4) > p > input[type=text]:nth-child(1)",
    first_three
  );
  await page.fill(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(5) > dd:nth-child(4) > p > input[type=text]:nth-child(2)",
    middle_four
  );
  await page.fill(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(5) > dd:nth-child(4) > p > input[type=text]:nth-child(3)",
    last_four
  );

  await delay(1000);

  await page.fill(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(6) > dd:nth-child(2) > p:nth-child(3) > input[type=text]",
    lottery.email.trim()
  );
  await page.fill(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(6) > dd:nth-child(3) > p:nth-child(2) > input[type=text]",
    lottery.email.trim()
  );

  await delay(1000);

  //nationality
  await page.selectOption(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(7) > dd > select",
    { label: lottery.country }
  );

  //password
  await page.fill(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(8) > dd > p:nth-child(2) > input[type=text]",
    lottery.applicationPassword ? lottery.applicationPassword : password.trim()
  );

  await page.screenshot({ path: "第一页.png" });

  await page.click(
    "#wrap > form > section:nth-child(2) > div:nth-child(2) > input.next"
  );

  //SHOW
  await delay(1000);
  await assertCurrentHeading(page, "Choice 1");
  await selectShow(page, lottery.showNo); // 1 based
  await page.click(
    "#wrap > form > section:nth-child(2) > div:nth-child(2) > input.next"
  );

  //SEAT
  await delay(2000);
  await selectSSSeat(page);
  await page.screenshot({ path: "第二页.png" });
  await page.click(
    "#wrap > form > section:nth-child(2) > div:nth-child(2) > input.next"
  );

  //COUNT
  await delay(2000);

  // fill peer information
  if (lottery.peerName && lottery.peerPhone) {
    await page.selectOption(
      "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl > dd:nth-child(3) > p > select",
      { value: "2" }
    );
    const peerNameSplit = lottery.peerName.split(" ");
    const peerFirstName = peerNameSplit[0].trim();
    const peerLastName = peerNameSplit[1].trim();
    await page.fill(
      "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl.vertical_table.white_back.line_top > dd:nth-child(3) > p:nth-child(2) > input[type=text]:nth-child(1)",
      peerFirstName
    );
    await page.fill(
      "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl.vertical_table.white_back.line_top > dd:nth-child(3) > p:nth-child(2) > input[type=text]:nth-child(2)",
      peerLastName
    );
    //peer phone
    const peerPhoneFull = truncatePhoneNumber(lottery.peerPhone, 11);
    await page.fill(
      "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl.vertical_table.white_back.line_top > dd:nth-child(3) > p:nth-child(5) > input[type=text]",
      peerPhoneFull
    );
  } else {
    await page.selectOption(
      "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl > dd:nth-child(3) > p > select",
      { value: "1" }
    );
  }

  await delay(
    chance.integer({
      min: 1000,
      max: chance.pickone([2000, 10000]),
    })
  );
  await page.screenshot({ path: "第三页.png" });
  await page.click(
    "#wrap > form > section:nth-child(2) > div:nth-child(2) > input.next"
  );

  //CONFIRM
  await delay(2000);
  await page.click(
    "#wrap > form > section:nth-child(2) > div:nth-child(2) > input.next"
  );

  //payment
  await delay(2000);
  await delay(
    chance.integer({
      min: 1000,
      max: chance.pickone([2000, 5000]),
    })
  );
  await page.fill(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl.vertical_table.white_back > dd:nth-child(3) > dl > dd:nth-child(4) > div > dl:nth-child(1) > dd > p:nth-child(1) > input[type=TEXT]",
    lottery.creditCardNo.trim()
  );
  await page.selectOption(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl.vertical_table.white_back > dd:nth-child(3) > dl > dd:nth-child(4) > div > dl:nth-child(2) > dd > p:nth-child(2) > select",
    { value: lottery.creditCardMonth.trim() }
  );

  const ccYearSelector =
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl.vertical_table.white_back > dd:nth-child(3) > dl > dd:nth-child(4) > div > dl:nth-child(2) > dd > p:nth-child(2) > input[type=TEXT]";

  //clear the input
  await page.fill(ccYearSelector, "");
  await page.fill(ccYearSelector, lottery.creditCardYear);

  await page.fill(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl.vertical_table.white_back > dd:nth-child(3) > dl > dd:nth-child(4) > div > dl:nth-child(4) > dd > p:nth-child(2) > input[type=password]",
    lottery.creditCardCVV.trim()
  );
  await delay(
    chance.integer({
      min: 1000,
      max: chance.pickone([2000, 8000]),
    })
  );
  await page.screenshot({ path: "支付信息.png" });
  await page.click(
    "#wrap > form > section:nth-child(2) > div:nth-child(2) > input.next"
  );

  let found = false;
  for (let i = 0; i < 100; i++) {
    if ((await getCurrentHeading(page)) == "Ticket Issuance select") {
      found = true;
      break;
    }
    await delay(600);
  }

  if (!found) {
    throw new Error("Unable to submit credit card");
  }

  await page.click(
    "#wrap > form > section:nth-child(2) > div:nth-child(2) > input.next"
  );
  await delay(
    chance.integer({
      min: 1000,
      max: chance.pickone([2000, 10000]),
    })
  );

  let lottery_summary = "";

  await delay(2000);

  let currentNavigation = await getCurrentNavigation(page);
  while (currentNavigation !== "Completion of Application") {
    await delay(5000);
    console.log("请在页面输入验证码");
    // import the captcha solver if exists
    let solveCaptchaAndSubmit = null;
    try {
      solveCaptchaAndSubmit = require("../captcha").solveCaptchaAndSubmit;
      await solveCaptchaAndSubmit(page, dryRun);
    } catch (e) {
      console.log(e);
      console.error("Captcha solver not found, skipping captcha solving.");
    }
    currentNavigation = await getCurrentNavigation(page);
  }

  await page.screenshot({ path: "抽奖完成.png" });

  const acpt_no = await page
    .locator(
      "#wrap > section:nth-child(5) > div > div.contents_body.lightpink_back > dl:nth-child(1) > dt > b > span:nth-child(2) > font"
    )
    .innerText();

  const summary_1 = await page
    .locator(
      "#wrap > section:nth-child(5) > div > div.contents_body.lightpink_back"
    )
    .innerText();

  const summary_2 = await page
    .locator(
      "#wrap > section:nth-child(6) > div > div.contents_body.lightblue_back"
    )
    .innerText();

  lottery_summary = trimSummary(
    "Accepted: " +
      acpt_no +
      "\n" +
      lottery_summary +
      "\n" +
      summary_1 +
      "\n" +
      summary_2
  );

  console.log(
    "抽奖已提交: ",
    acpt_no,
    lottery.applicationPassword ? lottery.applicationPassword : password.trim()
  );

  return {
    slcd,
    applicationId: acpt_no,
    applicationPassword: lottery.applicationPassword
      ? lottery.applicationPassword
      : password.trim(),
    summary: lottery_summary,
  };
};

module.exports = {
  completeOverseaLottery,
};

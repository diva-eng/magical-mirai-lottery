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
const { assertCurrentHeading } = require("./heading");
const { assertCurrentNavigation, getCurrentNavigation } = require("./navigate");

const completeOverseaLottery = async (page, lottery, link, dryRun = false) => {
  const password = chance().string({ length: 6, alpha: false, numeric: true });
  await page.goto(link);
  const slcd = await getSlcd(page);
  await page.click("#wrap > form > section > div > input");
  await page.click("#upppd");
  await page.click("#speed_regist_enabled");

  await assertCurrentNavigation(page, "Application Input");
  await assertCurrentHeading(page, "Entry of your information input");

  await page.fill(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(2) > dd > p > input[type=text]:nth-child(1)",
    lottery.firstName.trim()
  );
  await page.fill(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(2) > dd > p > input[type=text]:nth-child(2)",
    lottery.lastName.trim()
  );
  if (lottery.gender == "Male") {
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
    password.trim()
  );

  // fill peer information
  if (lottery.peerName && lottery.peerPhone) {
    const peerNameSplit = lottery.peerName.split(" ");
    const peerFirstName = peerNameSplit[0].trim();
    const peerLastName = peerNameSplit[1].trim();
    await page.fill(
      "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(9) > dd > p:nth-child(2) > input[type=text]:nth-child(1)",
      peerFirstName
    );
    await page.fill(
      "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(9) > dd > p:nth-child(2) > input[type=text]:nth-child(2)",
      peerLastName
    );
    //peer phone
    const peerPhoneFull = truncatePhoneNumber(lottery.peerPhone, 11);
    await page.fill(
      "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl:nth-child(9) > dd > p:nth-child(4) > input[type=text]",
      peerPhoneFull
    );
  }
  await delay(
    chance().integer({
      min: 1000,
      max: chance().pickone([2000, 10000]),
    })
  );

  await page.click(
    "#wrap > form > section:nth-child(2) > div:nth-child(2) > input.next"
  );

  //SHOW
  await delay(10000);
  await assertCurrentHeading(page, "Priority 1");
  await selectShow(page, lottery.showNo); // 1 based
  await page.click(
    "#wrap > form > section:nth-child(2) > div:nth-child(2) > input.next"
  );

  //SEAT
  await delay(2000);
  await selectSSSeat(page);
  await page.click(
    "#wrap > form > section:nth-child(2) > div:nth-child(2) > input.next"
  );

  //COUNT
  await delay(2000);
  await page.selectOption(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl > dd:nth-child(3) > p > select",
    { value: "2" }
  );
  await page.click(
    "#wrap > form > section:nth-child(2) > div:nth-child(2) > input.next"
  );

  //CONFIRM
  await delay(2000);
  await page.click(
    "#wrap > form > section:nth-child(3) > div:nth-child(2) > input.next"
  );

  //payment
  await delay(2000);
  await delay(
    chance().integer({
      min: 1000,
      max: chance().pickone([2000, 5000]),
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
    chance().integer({
      min: 1000,
      max: chance().pickone([2000, 8000]),
    })
  );
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
    chance().integer({
      min: 1000,
      max: chance().pickone([2000, 10000]),
    })
  );

  const captchaResult = await solveCaptchaAndSubmit(page, dryRun);

  const { captcha_passed, captcha_solve_tries, captcha_submit_tries } =
    captchaResult;
  let { lottery_summary } = captchaResult;

  if (dryRun) {
    return {
      id: lottery.id.toString(),
      slcd,
      applicationId: `DRYRUN_${chance().integer({ min: 99999999 })}_DRYRUN`,
      applicationPassword: `DRYRUN_${chance().integer({
        min: 99999999,
      })}_DRYRUN`,
      summary: trimSummary(
        "Oversea Accepted: 2495478939\nCaptchaRun: 1,1\n● Name: Siyuan Gao\n● Gender: Male\n● Birthday: 1993/02/21\n● Telephone Number: 604-880-8496\n● Email Address: ▼ An application completion email/a result notification email will be sent to this email address. Please make sure to input your email address correctly.\t\t\t\t\t\t*Please register an email address correctly and configure the setting to allow emails from @pia.co.jp to be received.\t\t\t\t\t\tsiyuan@owo.ac\n● Nationality: Canada\n● Your companion(s) Information: ▼ Name\t\t\t\t\t\tSuki Jiang\t\t\t\t\t\t▼ Telephone Number\t\t\t\t\t\t9175132345\n● Priority 1: Sun, Aug 18/2024 16:30 【Night Show】 Fukuoka Sunpalace\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tSS seat(＋exh tix) - 10,500JPY x 2 = 21,000JPY\n"
      ),
    };
  }

  if (!captcha_passed) {
    throw new Error("Failed to solve captcha");
  }

  await delay(5000);
  const currentNavigation = await getCurrentNavigation(page);
  if (currentNavigation !== "Completion of Application") {
    throw new Error(
      "Unable to submit application, check credit card information"
    );
  }

  const acpt_no = await page
    .locator(
      "#wrap > section:nth-child(5) > div > div.contents_body.lightpink_back > dl:nth-child(1) > dt > b > span:nth-child(2) > font"
    )
    .innerText();

  const captcha_status = captcha_solve_tries + "," + captcha_submit_tries;

  lottery_summary = trimSummary(
    "Oversea Accepted: " +
      acpt_no +
      "\nCaptchaRun: " +
      captcha_status +
      "" +
      "\n" +
      lottery_summary
  );

  console.log("Lottery Submitted: ", acpt_no, password);
  return {
    id: lottery.id.toString(),
    slcd,
    applicationId: acpt_no,
    applicationPassword: password,
    summary: lottery_summary,
  };
};

module.exports = {
  completeOverseaLottery,
};

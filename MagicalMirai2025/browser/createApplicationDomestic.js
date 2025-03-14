const chance = require("chance").Chance();
const { trimSummary, splitDate, delay, splitPhoneNumber } = require("../utils");
const { selectShow, selectSSSeat } = require("./action");
const { getSlcd } = require("./element");
const { assertCurrentHeading } = require("./heading");
const { assertCurrentNavigation, getCurrentNavigation } = require("./navigate");

const completeDomesticLottery = async (page, lottery, link, dryRun = false) => {
  const password = chance.string({ length: 6, alpha: false, numeric: true });
  await page.goto(link);
  await page.click(
    "#wrap > section:nth-child(7) > div:nth-child(1) > div:nth-child(2) > dl:nth-child(2) > dd:nth-child(2) > p:nth-child(1) > input:nth-child(1)"
  );
  await page.click("#wrap > form > section > div > input");
  await page.click("#upppd");
  await page.click("#speed_regist_enabled");

  await assertCurrentNavigation(page, "申込入力");
  await assertCurrentHeading(page, "お客様情報入力");

  const slcd = await getSlcd(page);

  await page.fill(
    "dl.vertical_table:nth-child(3) > dd:nth-child(2) > input:nth-child(4)",
    lottery.firstName.trim()
  );
  await page.fill(
    "dl.vertical_table:nth-child(3) > dd:nth-child(2) > input:nth-child(3)",
    lottery.lastName.trim()
  );
  await page.fill(
    "dl.vertical_table:nth-child(3) > dd:nth-child(3) > input:nth-child(4)",
    lottery.firstNameKana ?? ""
  );
  await page.fill(
    "dl.vertical_table:nth-child(3) > dd:nth-child(3) > input:nth-child(3)",
    lottery.lastNameKana ?? ""
  );
  if (lottery.gender.toLowerCase() == "male") {
    await page.check(
      "dl.vertical_table:nth-child(4) > dd:nth-child(2) > p:nth-child(1) > input:nth-child(2)"
    );
  } else {
    await page.check(
      "dl.vertical_table:nth-child(4) > dd:nth-child(2) > p:nth-child(1) > input:nth-child(1)"
    );
  }

  const { year, month, day } = splitDate(lottery.birthDate);
  await page.selectOption(
    "dl.vertical_table:nth-child(5) > dd:nth-child(2) > p:nth-child(1) > select:nth-child(1)",
    { value: year }
  );
  await page.selectOption(
    "dl.vertical_table:nth-child(5) > dd:nth-child(2) > p:nth-child(1) > select:nth-child(2)",
    { value: month }
  );
  await page.selectOption(
    "dl.vertical_table:nth-child(5) > dd:nth-child(2) > p:nth-child(1) > select:nth-child(3)",
    { value: day }
  );

  const [first_three, middle_four, last_four] = splitPhoneNumber(lottery.phone);
  console.log(
    "Phone Number: ",
    lottery.phone,
    first_three,
    middle_four,
    last_four
  );
  await page.fill(
    "dl.vertical_table:nth-child(6) > dd:nth-child(2) > p:nth-child(3) > input:nth-child(1)",
    first_three
  );
  await page.fill(
    "dl.vertical_table:nth-child(6) > dd:nth-child(2) > p:nth-child(3) > input:nth-child(2)",
    middle_four
  );
  await page.fill(
    "dl.vertical_table:nth-child(6) > dd:nth-child(2) > p:nth-child(3) > input:nth-child(3)",
    last_four
  );

  await page.fill(
    "dl.vertical_table:nth-child(7) > dd:nth-child(2) > p:nth-child(3) > input:nth-child(1)",
    lottery.email.trim()
  );
  await page.fill(
    "dl.vertical_table:nth-child(7) > dd:nth-child(3) > p:nth-child(2) > input:nth-child(1)",
    lottery.email.trim()
  );

  await delay(1000);

  if (!lottery.postalCode) {
    throw new Error("Postal code is required");
  }
  const [firstPart, secondPart] = lottery.postalCode.split("-");
  console.log("Postal Code: ", lottery.postalCode, firstPart, secondPart);
  await page.fill(
    "dl.vertical_table:nth-child(8) > dd:nth-child(2) > p:nth-child(2) > input:nth-child(1)",
    firstPart
  );
  await page.fill(
    "dl.vertical_table:nth-child(8) > dd:nth-child(2) > p:nth-child(2) > input:nth-child(2)",
    secondPart
  );
  await page.click("#zip_search");
  await delay(1000);
  await page.fill(
    "dl.vertical_table:nth-child(9) > dd:nth-child(5) > p:nth-child(2) > input:nth-child(1)",
    "番地なし"
  );

  await page.fill(
    "dl.vertical_table:nth-child(11) > dd:nth-child(2) > p:nth-child(2) > input:nth-child(1)",
    lottery.applicationPassword ? lottery.applicationPassword : password.trim()
  );

  if (lottery.peerName && lottery.peerPhone) {
    await page.fill(
      "dl.vertical_table:nth-child(12) > dd:nth-child(3) > p:nth-child(1) > input:nth-child(6)",
      lottery.peerName.trim()
    );
    await page.fill(
      "dl.vertical_table:nth-child(12) > dd:nth-child(3) > p:nth-child(2) > input:nth-child(6)",
      lottery.peerPhone.trim()
    );
  }
  await delay(chance.integer({ min: 1000, max: chance.pickone([2000, 5000]) }));

  await page.click(
    "#wrap > form > section:nth-child(2) > div:nth-child(2) > input.next"
  );

  await delay(1000);
  await assertCurrentHeading(page, "第1希望");
  await selectShow(page, lottery.showNo);
  await page.click(
    "#wrap > form > section:nth-child(2) > div:nth-child(2) > input.next"
  );

  await delay(2000);
  await selectSSSeat(page);
  await page.click(
    "#wrap > form > section:nth-child(2) > div:nth-child(2) > input.next"
  );

  await delay(1000);
  await page.selectOption(
    "#wrap > form > section:nth-child(1) > div > div.contents_body.lightpink_back > dl > dd:nth-child(3) > p > select",
    { value: "2" }
  );
  await page.click(
    "#wrap > form > section:nth-child(2) > div:nth-child(2) > input.next"
  );

  await delay(1000);
  await page.click(
    "#wrap > form > section:nth-child(3) > div:nth-child(2) > input.next"
  );

  await delay(1000);
  await delay(chance.integer({ min: 1000, max: chance.pickone([2000, 5000]) }));

  if (lottery.paymentType == "711") {
    await page.click(
      "dl.white_back:nth-child(3) > dd:nth-child(3) > dl:nth-child(1) > dt:nth-child(1) > input:nth-child(1)"
    );
  } else if (lottery.paymentType == "creditCard") {
    await page.click(
      "dl.white_back:nth-child(3) > dd:nth-child(4) > dl:nth-child(1) > dt:nth-child(1) > input:nth-child(1)"
    );

    await page.fill(
      "dl.vertical_table:nth-child(1) > dd:nth-child(2) > p:nth-child(1) > input:nth-child(1)",
      lottery.creditCardNo.trim()
    );

    await page.selectOption(
      "dl.vertical_table:nth-child(2) > dd:nth-child(2) > p:nth-child(2) > select:nth-child(2)",
      { value: lottery.creditCardMonth.trim() }
    );

    const ccYearSelector =
      "dl.vertical_table:nth-child(2) > dd:nth-child(2) > p:nth-child(2) > input:nth-child(1)";

    await page.fill(ccYearSelector, "");
    await page.fill(ccYearSelector, lottery.creditCardYear);

    await page.click(
      "dl.floralwhite_back:nth-child(3) > dd:nth-child(2) > p:nth-child(1) > input:nth-child(1)"
    );

    await page.fill(
      "dl.vertical_table:nth-child(4) > dd:nth-child(2) > p:nth-child(2) > input:nth-child(1)",
      lottery.creditCardCVV.trim()
    );
  }

  await delay(chance.integer({ min: 1000, max: chance.pickone([2000, 4000]) }));
  await page.click(
    "#wrap > form > section:nth-child(2) > div:nth-child(2) > input.next"
  );

  if (lottery.piaEmail && lottery.piaPassword) {
    await page.click(
      "dl.floralwhite_back:nth-child(1) > dd:nth-child(2) > p:nth-child(1) > input:nth-child(1)"
    );
    await page.keyboard.type(lottery.piaEmail.trim());
    await delay(1000);
    await page.fill(
      "dl.floralwhite_back:nth-child(2) > dd:nth-child(2) > p:nth-child(1) > input:nth-child(1)",
      lottery.piaPassword
    );
  } else {
    throw new Error("Pia email and password are required");
  }

  await page.click(".next");

  await delay(chance.integer({ min: 1000, max: chance.pickone([2000, 5000]) }));

  let lottery_summary = "";

  await delay(2000);

  let currentNavigation = await getCurrentNavigation(page);
  while (currentNavigation !== "申込完了") {
    await delay(1000);
    currentNavigation = await getCurrentNavigation(page);
  }

  const acpt_no = await page
    .locator(
      ".box_in3 > dl:nth-child(2) > dt:nth-child(1) > b:nth-child(1) > span:nth-child(1)"
    )
    .innerText();

  const captcha_status = captcha_solve_tries + "," + captcha_submit_tries;

  const summary_1 = await page
    .locator("#wrap > section:nth-child(6)")
    .innerText();

  const summary_2 = await page
    .locator("#wrap > section:nth-child(7)")
    .innerText();

  lottery_summary = trimSummary(
    "Accepted: " +
      acpt_no +
      "\nCaptchaRun: " +
      captcha_status +
      "" +
      "\n" +
      lottery_summary +
      "\n" +
      summary_1 +
      "\n" +
      summary_2
  );

  console.log(
    "Lottery Submitted: ",
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

module.exports = { completeDomesticLottery };

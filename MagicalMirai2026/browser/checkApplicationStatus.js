const { delay } = require("../utils");
const { getResult } = require("./element");

const ApplicationStatus = {
  CREATED: "created",
  ACCEPTED: "accepted",
  WON: "won",
  LOST: "lost",
};

module.exports.ApplicationStatus = ApplicationStatus;

const checkApplicationStatus = async (page, body, link) => {
  await page.goto(link);

  await page.waitForSelector("#wrap > form:nth-child(4)");
  await page.fill("input[name=acpt_no]", body.applicationId);
  await page.fill("input[name=pass]", body.applicationPassword);

  await delay(2000);

  await page.click("input[name=entry1]");

  await page.waitForSelector("#wrap > section:nth-child(5) > div:nth-child(1)");

  let applicationResult = null;

  while (!applicationResult) {
    try {
      applicationResult = await getResult(page);
    } catch (error) {
      console.error("Error fetching application result, retrying...", error);
      await delay(2000); // Wait before retrying
    }
  }

  let applicationStatus = ApplicationStatus.ACCEPTED;

  if (
    applicationResult.includes("FAILED") ||
    applicationResult.includes("落選")
  ) {
    applicationStatus = ApplicationStatus.LOST;
  } else if (
    applicationResult.includes("WON") ||
    applicationResult.includes("当選")
  ) {
    applicationStatus = ApplicationStatus.WON;
  }

  return {
    slcd: body.slcd,
    applicationStatus,
  };
};

module.exports = { checkApplicationStatus };

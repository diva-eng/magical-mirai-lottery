process.env.PLAYWRIGHT_BROWSERS_PATH = 0;

const fs = require("fs");
const util = require("util");
const { chromium } = require("playwright");
const applications = require("./applications.json");
const {
  completeDomesticLottery,
} = require("./MagicalMirai2025/browser/createApplicationDomestic");

let browser = null;

const dryRun = process.argv.includes("--dry-run");

const logFile = fs.createWriteStream("application.log", { flags: "a" });
const logStdout = process.stdout;

console.log = function () {
  logFile.write(
    new Date().toISOString() + " - " + util.format.apply(null, arguments) + "\n"
  );
  logStdout.write(
    new Date().toISOString() + " - " + util.format.apply(null, arguments) + "\n"
  );
};

console.error = console.log;

console.log("干运行:", dryRun);

async function fill_application(application) {
  browser = await chromium.launch({
    headless: false,
    executablePath: "",
    ignoreDefaultArgs: ["--mute-audio"],
    args: ["--ignore-certificate-errors"],
  });
  const page = await browser.newPage();

  const applicationResult = await completeDomesticLottery(
    page,
    application,
    "https://pia.jp/piajp/v/magicalmirai25-1/",
    dryRun
  );
  await page.screenshot({ path: "关闭页面前.png" });
  page.close();
  return applicationResult;
}

async function fill_applications() {
  console.log("加载的申请:", applications);
  if (!applications || applications.length === 0) {
    console.log("没有要填写的申请");
    return;
  }

  // Create a unique directory for this run
  const dirName = `results-${new Date().toISOString().replace(/:/g, "-")}`;
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName);
  }
  process.chdir(dirName);
  console.log("当前目录:", process.cwd());

  const fileName = `results.csv`;

  // Create a new file to store the results, write and close the file
  const resultFile = fs.createWriteStream(fileName);
  resultFile.write(
    "\ufeff" +
      "firstName,lastName,email,applicationId,applicationPassword,slcd,summary\n"
  );
  resultFile.close();
  // Iterate over each application and fill it
  for (const application of applications) {
    const { firstName, lastName, email } = application;
    console.log(`正在填写申请 ${lastName} ${firstName}, ${email}`);
    const result = await fill_application(application);
    console.log("结果:", result);
    const { applicationId, applicationPassword, slcd, summary } = result;
    // Append the result to the results.csv file
    const resultFile = fs.createWriteStream(fileName, { flags: "a" });
    resultFile.write(
      `${firstName},${lastName},${email},${applicationId},${applicationPassword},${slcd},"${summary}"\n`
    );
    resultFile.close();
    console.log(
      `申请已填写 ${lastName} ${firstName}, ${email}. 摘要: ${summary}`
    );
  }
}

fill_applications()
  .then(() => {
    console.log("申请填写成功");
  })
  .catch((error) => {
    console.error("填写申请时出错:", error);
  })
  .finally(async () => {
    await browser.close();
  });

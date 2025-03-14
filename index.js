process.env.PLAYWRIGHT_BROWSERS_PATH = 0;

const { parse } = require("csv-parse");
const fs = require("fs");
const { chromium } = require("playwright");
const {
  completeDomesticLottery,
} = require("./MagicalMirai2025/browser/createApplicationDomestic");

let browser = null;

const dryRun = process.argv.includes("--dry-run");

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
  page.close();
  return applicationResult;
}

const processFile = async () => {
  records = [];
  const parser = fs.createReadStream(`${__dirname}/applications.csv`).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
    })
  );
  for await (const record of parser) {
    records.push(record);
  }
  return records;
};

async function fill_applications() {
  // Parse the CSV file to get the applications
  const applications = await processFile();

  console.log("加载的申请:", applications);
  if (!applications || applications.length === 0) {
    console.log("没有要填写的申请");
    return;
  }

  // Create a unique file name for the results
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const fileName = `results-${timestamp}.csv`;

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

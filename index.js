process.env.PLAYWRIGHT_BROWSERS_PATH = 0;

const fs = require("fs");
const util = require("util");
const { chromium } = require("playwright");
const applications = require("./applications.json");
const { program } = require("commander");
const {
  completeDomesticLottery,
} = require("./MagicalMirai2025/browser/createApplicationDomestic");

const {
  completeOverseaLottery,
} = require("./MagicalMirai2025/browser/createApplicationOverseas");

let browser = null;

// Load proxies.txt file and parse it into an array of objects
const proxies = fs
  .readFileSync("proxies.txt", "utf-8")
  .split("\n")
  .map((line) => line.trim());

async function getRandomProxy() {
  // Get random proxy from array and test using playwright
  while (true) {
    const randomIndex = Math.floor(Math.random() * proxies.length);
    const proxy = proxies[randomIndex].trim();
    if (!proxy) continue; // Skip empty lines
    console.log("Testing proxy:", proxy);
    const browser = await chromium.launch({
      headless: true,
      args: [`--proxy-server=${proxy}`],
    });
    const page = await browser.newPage();
    try {
      await page.goto("https://httpbin.org/ip", {
        waitUntil: "domcontentloaded",
      });
      const content = await page.content();
      if (content.includes("origin")) {
        console.log("Proxy is working:", proxy);
        return proxy;
      } else {
        console.log("Proxy failed:", proxy);
      }
    } catch (error) {
      console.error("Error testing proxy:", error);
    } finally {
      await browser.close();
    }
  }
}

// process node index.js --dry-run --type "$($selectedLottery.Type)" --url "$($selectedLottery.Url)"
program
  .name("magical-mirai-lottery")
  .version("0.0.1")
  .description("Fill out lottery applications")
  .option("-d, --dry-run", "Perform a dry run without actual submission")
  .option("--use-proxy", "Use a random proxy from proxies.txt")
  .option("-t, --type <type>", "Type of lottery")
  .option("-u, --url <url>", "URL of the lottery");

program.parse(process.argv);
console.log("命令行参数:", process.argv);
console.log("命令行参数:", program.opts());

const options = program.opts();
const { dryRun, type, url, useProxy } = options;

// url and type is required
if (!type || !url) {
  console.error("URL and type are required.");
  process.exit(1);
}

const lotteryUrlRegex =
  /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/[^\s]*)?$/i;
if (!lotteryUrlRegex.test(url)) {
  console.error("Invalid URL format.");
  process.exit(1);
}
if (!["domestic", "overseas"].includes(type)) {
  console.error("Invalid lottery type. Must be 'domestic' or 'overseas'.");
  process.exit(1);
}

console.log("抽奖类型:", type);
console.log("抽奖网址:", url);
console.log("干运行:", dryRun);
console.log("使用代理:", useProxy);
console.log("当前目录:", process.cwd());
console.log("当前时间:", new Date().toISOString());

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

async function fill_application(application, lottery_type, lottery_url, proxy) {
  browser = await chromium.launch({
    headless: false,
    executablePath: "",
    proxy: proxy
      ? {
          server: proxy,
        }
      : undefined,
    ignoreDefaultArgs: ["--mute-audio"],
    args: ["--ignore-certificate-errors"],
  });
  const page = await browser.newPage();

  let applicationResult = null;

  // Based on lottery type, call completeDomesticLottery or completeOverseaLottery
  if (lottery_type === "overseas") {
    applicationResult = await completeOverseaLottery(
      page,
      application,
      lottery_url,
      dryRun
    );
  } else if (lottery_type === "domestic") {
    applicationResult = await completeDomesticLottery(
      page,
      application,
      lottery_url,
      dryRun
    );
  }

  await page.screenshot({ path: "关闭页面前.png" });
  page.close();
  return applicationResult;
}

async function fill_applications(lottery_type, lottery_url) {
  console.log("加载的申请:", applications);
  if (!applications || applications.length === 0) {
    console.log("没有要填写的申请");
    return;
  }

  // If useProxy is true, get a random proxy list equal to the number of applications
  let proxyList = [];
  if (useProxy) {
    proxyList = await Promise.all(
      applications.map(async () => {
        const proxy = await getRandomProxy();
        return proxy;
      })
    );
  }

  console.log("代理列表:", proxyList);

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
    const result = await fill_application(
      application,
      lottery_type,
      lottery_url,
      useProxy ? proxyList[applications.indexOf(application)] : null
    );
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

fill_applications(type, url)
  .then(() => {
    console.log("申请填写成功");
  })
  .catch((error) => {
    console.error("填写申请时出错:", error);
  })
  .finally(async () => {
    await browser.close();
  });

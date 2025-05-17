process.env.PLAYWRIGHT_BROWSERS_PATH = 0;

const fs = require("fs");
const util = require("util");
const { chromium } = require("playwright");
// const stealth = require("playwright-extra-plugin-stealth");

// chromium.use(stealth());

const APPLICATION_CHECK_URL = "https://va.pia.jp/SpLotResult.do?slcd=";

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
];

const applications = require("./applications.json");
const { program } = require("commander");
const {
  completeDomesticLottery,
} = require("./MagicalMirai2025/browser/createApplicationDomestic");

const {
  completeOverseaLottery,
} = require("./MagicalMirai2025/browser/createApplicationOverseas");
const {
  checkApplicationStatus,
} = require("./MagicalMirai2025/browser/checkApplicationStatus");

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
  .option("--bot-test", "Test the bot detection defense system")
  .option("--check-application", "Check application status")
  .option("--use-proxy", "Use a random proxy from proxies.txt")
  .option("-t, --type <type>", "Type of lottery")
  .option("-u, --url <url>", "URL of the lottery");

program.parse(process.argv);
console.log("命令行参数:", process.argv);
console.log("命令行参数:", program.opts());

const options = program.opts();
const { dryRun, type, url, useProxy, botTest, checkApplication } = options;

// url and type is required
if (!type || !url) {
  if (!botTest && !checkApplication) {
    console.error("URL and type are required.");
    process.exit(1);
  }
}

const lotteryUrlRegex =
  /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/[^\s]*)?$/i;

if (!botTest && !checkApplication) {
  if (!lotteryUrlRegex.test(url)) {
    console.error("Invalid URL format.");
    process.exit(1);
  }

  if (!["domestic", "overseas"].includes(type)) {
    console.error("Invalid lottery type. Must be 'domestic' or 'overseas'.");
    process.exit(1);
  }
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

async function openBrowerAndNavigate(proxy) {
  const randomUserAgent =
    userAgents[Math.floor(Math.random() * userAgents.length)];
  browser = await chromium.launch({
    headless: false,
    executablePath: "",
    proxy: proxy
      ? {
          server: proxy,
        }
      : undefined,
    ignoreDefaultArgs: ["--mute-audio"],
    args: [
      "--ignore-certificate-errors",
      "--disable-blink-features=AutomationControlled",
    ],
  });
  const context = await browser.newContext({
    userAgent: randomUserAgent,
  });
  const page = await context.newPage();
  await page.setViewportSize({
    width: Math.floor(1280 + Math.random() * 100),
    height: Math.floor(720 + Math.random() * 100),
  });

  await context.clearCookies();
  return page;
}

async function fill_application(application, lottery_type, lottery_url, proxy) {
  const page = await openBrowerAndNavigate(proxy);

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
    const { firstName, lastName, email, showNo } = application;
    console.log(`正在填写申请 ${lastName} ${firstName}, ${email}, ${showNo}`);
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

// Check

async function main() {
  if (botTest) {
    console.log("Bot test mode activated. Skipping application filling.");
    const page = await openBrowerAndNavigate();
    await page.goto("https://bot.sannysoft.com/", {
      waitUntil: "domcontentloaded",
    });
    // process.exit(0);
  } else if (checkApplication) {
    // Get all the result folders with results- prefix
    const resultFolders = fs
      .readdirSync(".")
      .filter(
        (file) => file.startsWith("results-") && fs.statSync(file).isDirectory()
      );
    const resultFiles = [];
    for (const folder of resultFolders) {
      const files = fs
        .readdirSync(folder)
        .filter((file) => file.endsWith(".csv"));
      if (files.length > 0) {
        resultFiles.push({
          folder: folder,
          file: files[0],
        });
      }
    }
    console.log("结果文件:", resultFiles);

    const allResults = [];

    // Load all result files csv content
    for (const resultFile of resultFiles) {
      const filePath = `${resultFile.folder}/${resultFile.file}`;
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n").slice(1); // Skip header
      for (const line of lines) {
        if (!line.trim()) continue; // Skip empty lines
        const [
          firstName,
          lastName,
          email,
          applicationId,
          applicationPassword,
          slcd,
          summary,
        ] = line.split(",");

        allResults.push({
          firstName,
          lastName,
          email,
          applicationId,
          applicationPassword,
          slcd,
          summary,
        });
      }
    }
    // Group by slcd
    const groupedResults = allResults.reduce((acc, result) => {
      if (!acc[result.slcd]) {
        acc[result.slcd] = [];
      }
      acc[result.slcd].push(result);
      return acc;
    }, {});

    // Output count for each slcd and total count
    const slcdCounts = Object.keys(groupedResults).map((slcd) => {
      return {
        slcd: slcd,
        count: groupedResults[slcd].length,
      };
    });
    const totalCount = allResults.length;
    console.log(
      "每个slcd的申请数量:",
      slcdCounts.map(({ slcd, count }) => `${slcd}: ${count}`).join(", ")
    );
    console.log("总申请数量:", totalCount);

    // Ask user to confirm before checking application status
    const confirm = await new Promise((resolve) => {
      process.stdout.write("是否继续检查申请状态？(y/n): ");
      process.stdin.once("data", (data) => resolve(data.toString().trim()));
    });

    if (confirm.toLowerCase() !== "y") {
      console.log("用户取消检查申请状态。");
      if (browser) {
        await browser.close();
      }
      return;
    }

    const applicationResults = [];

    // Check each slcd
    for (const slcd of Object.keys(groupedResults)) {
      const results = groupedResults[slcd];
      // Check each application status
      for (const result of results) {
        const { firstName, lastName, email, applicationId } = result;
        console.log(
          `正在检查申请 ${lastName} ${firstName}, ${email}, ${applicationId}, ${slcd} 的状态...`
        );
        const page = await openBrowerAndNavigate(undefined);
        const applicationResult = await checkApplicationStatus(
          page,
          result,
          APPLICATION_CHECK_URL + slcd
        );
        console.log("申请结果:", applicationResult);
        applicationResults.push({
          ...result,
          ...applicationResult,
        });
        page.close();
      }
    }

    // Group by application status, and count
    const applicationStatusCounts = applicationResults.reduce((acc, result) => {
      if (!acc[result.applicationStatus]) {
        acc[result.applicationStatus] = 0;
      }
      acc[result.applicationStatus]++;
      return acc;
    }, {});
    console.log(
      "每个申请状态的数量:",
      Object.keys(applicationStatusCounts)
        .map((status) => `${status}: ${applicationStatusCounts[status]}`)
        .join(", ")
    );

    // Calculate percentage for each status
    const applicationStatusPercentages = Object.keys(
      applicationStatusCounts
    ).map((status) => {
      return {
        status: status,
        percentage: (
          (applicationStatusCounts[status] / totalCount) *
          100
        ).toFixed(2),
      };
    });

    // Get the won application
    const wonApplications = applicationResults.filter(
      (result) => result.applicationStatus === "won"
    );

    const wonFileName = `${new Date()
      .toISOString()
      .replace(/[:]/g, "_")}-won-applications.csv`;

    const wonFileContent = [
      "\ufeff" +
        "firstName,lastName,email,applicationId,applicationPassword,slcd,summary\n",
    ];

    // Prepare the won applications content
    if (wonApplications.length > 0) {
      for (const application of wonApplications) {
        const {
          firstName,
          lastName,
          email,
          applicationId,
          applicationPassword,
        } = application;
        wonFileContent.push(
          `${firstName},${lastName},${email},${applicationId},${applicationPassword},${application.slcd},"${application.summary}"\n`
        );
        console.log(
          `中奖申请已保存 ${lastName} ${firstName}, ${email}. 摘要: ${application.summary}`
        );
      }

      // Write the content to the file using fs.promises
      await fs.promises.writeFile(wonFileName, wonFileContent.join(""));
      console.log(`中奖申请已保存到文件: ${wonFileName}`);
    } else {
      console.log("没有中奖的申请。");
    }

    console.log(
      "每个申请状态的百分比:",
      applicationStatusPercentages
        .map(({ status, percentage }) => `${status}: ${percentage}%`)
        .join(", ")
    );
  } else {
    await fill_applications(type, url);
    console.log("所有申请已填写完毕。请检查结果文件。");
    if (browser) {
      await browser.close();
    }
  }
}

main().then(() => {
  console.log("所有操作已完成。");
  if (browser) {
    browser.close();
  }
  process.exit(0);
});

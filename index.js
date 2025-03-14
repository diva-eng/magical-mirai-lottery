process.env.PLAYWRIGHT_BROWSERS_PATH = 0;

const { parse } = require("csv-parse");
const fs = require("fs");
const { chromium } = require("playwright");
const {
  completeDomesticLottery,
} = require("./MagicalMirai2025/browser/createApplicationDomestic");

let browser = null;

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
    true
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

  console.log("Applications loaded:", applications);
  if (!applications || applications.length === 0) {
    console.log("No applications to fill");
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
    console.log(`Filling application for ${lastName} ${firstName}, ${email}`);
    const result = await fill_application(application);
    console.log("Result:", result);
    const { applicationId, applicationPassword, slcd, summary } = result;
    // Append the result to the results.csv file
    const resultFile = fs.createWriteStream(fileName, { flags: "a" });
    resultFile.write(
      `${firstName},${lastName},${email},${applicationId},${applicationPassword},${slcd},"${summary}"\n`
    );
    resultFile.close();
    console.log(
      `Application filled for ${lastName} ${firstName}, ${email}. Summary: ${summary}`
    );
  }
}

fill_applications()
  .then(() => {
    console.log("Applications filled successfully");
  })
  .catch((error) => {
    console.error("Error filling applications:", error);
  })
  .finally(async () => {
    await browser.close();
  });

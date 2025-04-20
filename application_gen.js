const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const questions = [
  "lastName: ",
  "lastNameKana: ",
  "firstName: ",
  "firstNameKana: ",
  "gender: ",
  "birthDate: ",
  "phone: ",
  "email: ",
  "country: ",
  "postalCode: ",
  "applicationPassword: ",
  "peerName: ",
  "peerPhone: ",
  "paymentType: ",
  "creditCardNo: ",
  "creditCardMonth: ",
  "creditCardYear: ",
  "creditCardCVV: ",
  "piaEmail: ",
  "piaPassword: ",
];

const shows = [
  "初音ミク「マジカルミライ 2025」【SENDAI公演】 2025年08月01日(金) 17:00 【夜公演】",
  "初音ミク「マジカルミライ 2025」【SENDAI公演】 2025年08月02日(土) 昼12:00 【昼公演】",
  "初音ミク「マジカルミライ 2025」【SENDAI公演】 2025年08月02日(土) 16:30 【夜公演】",
  "初音ミク「マジカルミライ 2025」【SENDAI公演】 2025年08月03日(日) 昼12:00 【昼公演】",
  "初音ミク「マジカルミライ 2025」【SENDAI公演】 2025年08月03日(日) 16:30 【夜公演】",
  "初音ミク「マジカルミライ 2025」【OSAKA公演】 2025年08月09日(土) 昼12:00 【昼公演】",
  "初音ミク「マジカルミライ 2025」【OSAKA公演】 2025年08月09日(土) 16:30 【夜公演】",
  "初音ミク「マジカルミライ 2025」【OSAKA公演】 2025年08月10日(日) 昼12:00 【昼公演】",
  "初音ミク「マジカルミライ 2025」【OSAKA公演】 2025年08月10日(日) 16:30 【夜公演】",
  "初音ミク「マジカルミライ 2025」【OSAKA公演】 2025年08月11日(月・祝) 昼12:00 【昼公演】",
  "初音ミク「マジカルミライ 2025」【OSAKA公演】 2025年08月11日(月・祝) 16:30 【夜公演】",
  "初音ミク「マジカルミライ 2025」【TOKYO公演】 2025年08月29日(金) 昼12:00 【昼公演】",
  "初音ミク「マジカルミライ 2025」【TOKYO公演】 2025年08月29日(金) 16:30 【夜公演】",
  "初音ミク「マジカルミライ 2025」【TOKYO公演】 2025年08月30日(土) 昼12:00 【昼公演】",
  "初音ミク「マジカルミライ 2025」【TOKYO公演】 2025年08月30日(土) 16:30 【夜公演】",
  "初音ミク「マジカルミライ 2025」【TOKYO公演】 2025年08月31日(日) 昼12:00 【昼公演】",
  "初音ミク「マジカルミライ 2025」【TOKYO公演】 2025年08月31日(日) 16:30 【夜公演】",
];
console.log("欢迎来到 Magical Mirai 2025 抽奖申请！");
console.log("请回答以下问题：");

let application = {};
let applications = [];

function askQuestion(index) {
  const translations = {
    "applicationPassword: ": "申请密码: ",
    "firstName: ": "名字: ",
    "firstNameKana: ": "名字假名 （海外票不用填写）: ",
    "lastName: ": "姓氏: ",
    "lastNameKana: ": "姓氏假名（海外票不用填写）: ",
    "email: ": "电子邮件 （如果随机不需要输入）: ",
    "country: ": "国家 （例：China）: ",
    "phone: ": "电话 (格式: 08000000000 十一位): ",
    "gender: ": "性别: ",
    "birthDate: ": "出生日期 (格式: YYYY-MM-DD): ",
    "postalCode: ": "邮政编码 (格式: 000-0000) 有效的日本邮政编码: ",
    "peerName: ": "同行者姓名 (海外票抽选需要 “姓 名”): ",
    "peerPhone: ": "同行者电话 (格式: 08000000000 十一位): ",
    "piaEmail: ": "Pia电子邮件: ",
    "piaPassword: ": "Pia密码: ",
    "paymentType: ": "支付类型 (711/creditCard) 海外只能creditCard: ",
    "creditCardNo: ": "信用卡号: ",
    "creditCardMonth: ": "信用卡有效月: ",
    "creditCardYear: ": "信用卡有效年: ",
    "creditCardCVV: ": "信用卡CVV: ",
  };

  if (index < questions.length) {
    const question = questions[index];
    const translatedQuestion = translations[question] || question;

    // Skip credit card questions if payment type is 711
    if (
      application.paymentType === "711" &&
      question.startsWith("creditCard")
    ) {
      askQuestion(index + 1);
    } else {
      rl.question(translatedQuestion, (answer) => {
        application[question.slice(0, -2)] = answer;
        askQuestion(index + 1);
      });
    }
  } else {
    rl.question("您将申请哪个演出？（1, all, custom）：", (answer) => {
      if (answer === "1") {
        console.log("可用的演出：");
        shows.forEach((show, index) => {
          console.log(`${index + 1}. ${show}`);
        });
        rl.question("请输入您要申请的演出编号：", (showNo) => {
          application.showNo = showNo;
          applications.push(application);
          saveApplications();
        });
      } else if (answer === "all") {
        shows.forEach((show, index) => {
          let newApplication = {
            ...application,
            showNo: (index + 1).toString(),
          };
          applications.push(newApplication);
        });
        saveApplications();
      } else if (answer === "custom") {
        console.log("可用的演出：");
        shows.forEach((show, index) => {
          console.log(`${index + 1}. ${show}`);
        });
        rl.question("输入逗号分隔的演出列表：", (showList) => {
          let showNumbers = showList.split(",").map((show) => show.trim());
          showNumbers.forEach((showNo) => {
            let newApplication = { ...application, showNo: showNo };
            applications.push(newApplication);
          });
          saveApplications();
        });
      } else {
        console.log("无效的选项。请再试一次。");
        askQuestion(index);
      }
    });
  }
}

function saveApplications() {
  async function handleMissingEmails() {
    let emailOption = null;
    let domain = null;
    let baseEmail = null;

    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      if (!app.email) {
        if (emailOption === null) {
          console.log("检测到缺少邮箱的申请。");
          emailOption = await new Promise((resolve) =>
            rl.question(
              "请选择生成邮箱的方式：1. 随机生成邮箱 2. 基于现有邮箱生成：",
              resolve
            )
          );

          if (emailOption === "1") {
            domain = await new Promise((resolve) =>
              rl.question("请输入域名（例如：miku.cx）：", resolve)
            );
          } else if (emailOption === "2") {
            baseEmail = await new Promise((resolve) =>
              rl.question("请输入基础邮箱（例如：user@gmail.com）：", resolve)
            );
          } else {
            console.log("无效的选项。请再试一次。");
            emailOption = null; // Reset to ask again
            i--; // Retry for the same application
            continue;
          }
        }

        if (emailOption === "1") {
          const randomString = Math.random().toString(36).substring(2, 9);
          app.email = `${randomString}@${domain}`;
          console.log(`生成的邮箱为：${app.email}`);
        } else if (emailOption === "2") {
          const [localPart, domainPart] = baseEmail.split("@");
          app.email = `${localPart}+${i + 1}@${domainPart}`;
          console.log(`生成的邮箱为：${app.email}`);
        }
      }
    }
  }

  handleMissingEmails().then(() => {
    fs.writeFile(
      "applications.json",
      JSON.stringify(applications, null, 2),
      (err) => {
        if (err) throw err;
        console.log("申请已保存！");
        rl.close();
      }
    );
  });
}

askQuestion(0);

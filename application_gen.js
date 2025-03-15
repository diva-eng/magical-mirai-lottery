const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const questions = [
  "applicationPassword: ",
  "firstName: ",
  "firstNameKana: ",
  "lastName: ",
  "lastNameKana: ",
  "email: ",
  "phone: ",
  "gender: ",
  "birthDate: ",
  "postalCode: ",
  "peerName: ",
  "peerPhone: ",
  "piaEmail: ",
  "piaPassword: ",
  "paymentType: ",
  "creditCardNo: ",
  "creditCardMonth: ",
  "creditCardYear: ",
  "creditCardCVV: ",
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
    "firstNameKana: ": "名字假名: ",
    "lastName: ": "姓氏: ",
    "lastNameKana: ": "姓氏假名: ",
    "email: ": "电子邮件: ",
    "phone: ": "电话 (格式: 08000000000 十一位): ",
    "gender: ": "性别: ",
    "birthDate: ": "出生日期 (格式: YYYY-MM-DD): ",
    "postalCode: ": "邮政编码 (格式: 000-0000) 有效的日本邮政编码: ",
    "peerName: ": "同行者姓名: ",
    "peerPhone: ": "同行者电话 (格式: 08000000000 十一位): ",
    "piaEmail: ": "Pia电子邮件: ",
    "piaPassword: ": "Pia密码: ",
    "paymentType: ": "支付类型: ",
    "creditCardNo: ": "信用卡号: ",
    "creditCardMonth: ": "信用卡有效月: ",
    "creditCardYear: ": "信用卡有效年: ",
    "creditCardCVV: ": "信用卡CVV: ",
  };

  if (index < questions.length) {
    const question = questions[index];
    const translatedQuestion = translations[question] || question;
    rl.question(translatedQuestion, (answer) => {
      application[question.slice(0, -2)] = answer;
      askQuestion(index + 1);
    });
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
  fs.writeFile(
    "applications.json",
    JSON.stringify(applications, null, 2),
    (err) => {
      if (err) throw err;
      console.log("申请已保存！");
      rl.close();
    }
  );
}

askQuestion(0);

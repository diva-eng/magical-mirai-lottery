# 魔法未来国内申请填表器使用说明

## 运行工具

1. 确保您已经安装了 Node.js。如果未安装，`run.bat` 会自动下载并安装 Node.js。
2. 双击或运行 `run.bat` 文件。该脚本将执行以下操作：

- 检查并安装 Node.js（如果尚未安装）。
- 安装项目依赖项。
- 安装 Playwright 及其浏览器依赖项。

3. 运行脚本后，您将看到以下菜单选项：

- 1. 以测试模式运行脚本
- 2. 以提交模式运行脚本
- 3. 退出

4. 选择相应的选项并按回车键：

- 选择 `1` 将以测试模式运行脚本（不会提交申请）。
- 选择 `2` 将以提交模式运行脚本（会提交申请）。
- 选择 `3` 将退出脚本。

5. 确认继续操作时，请确保您已在 `applications.csv` 文件中修改并添加所有申请条目。

## 编辑 `applications.csv`

`applications.csv` 文件包含所有申请条目。请按照以下格式编辑文件：

```plaintext
applicationPassword,firstName,firstNameKana,lastName,lastNameKana,email,phone,gender,birthDate,postalCode,showNo,peerName,peerPhone,piaEmail,piaPassword,paymentType,creditCardNo,creditCardMonth,creditCardYear,creditCardCVV
```

### 列说明

- `applicationPassword`: 申请密码
- `firstName`: 名字
- `firstNameKana`: 名字的假名
- `lastName`: 姓氏
- `lastNameKana`: 姓氏的假名
- `email`: 电子邮件地址
- `phone`: 电话号码
- `gender`: 性别
- `birthDate`: 出生日期 (格式: YYYY-MM-DD)
- `postalCode`: 邮政编码
- `showNo`: 演出编号
- `peerName`: 同行者名字
- `peerPhone`: 同行者电话
- `piaEmail`: Pia 账户电子邮件
- `piaPassword`: Pia 账户密码
- `paymentType`: 支付类型 (例如: creditCard)
- `creditCardNo`: 信用卡号码
- `creditCardMonth`: 信用卡有效期月份 (格式: MM)
- `creditCardYear`: 信用卡有效期年份 (格式: YYYY)
- `creditCardCVV`: 信用卡 CVV 码

### 示例条目

```plaintext
393939,太郎,タロウ,山田,ヤマダ,example@example.com,09012345678,男,1990-01-01,1234567,1,花子,09087654321,pia@example.com,piaPassword,creditCard,1234567812345678,12,2025,123
```

## 输出申请信息

运行脚本后，生成的申请信息将保存在 `results-YYYY-MM-DDTHH-MM-SS.sssZ.csv` 文件中。文件名中的时间戳表示生成文件的时间。

### 输出文件格式

输出文件包含以下列：

```plaintext
firstName,lastName,email,applicationId,applicationPassword,slcd,summary
```

### 列说明

- `firstName`: 名字
- `lastName`: 姓氏
- `email`: 电子邮件地址
- `applicationId`: 申请编号
- `applicationPassword`: 申请密码
- `slcd`: 申请状态代码
- `summary`: 申请摘要

### 示例输出

```plaintext
太郎,山田,example@example.com,123456,393939,0,申请成功
```

请根据需要查看和保存输出文件中的申请信息。

export const checkElementExistence = async (page, selector) => {
  const element = await page.$(selector);
  return element !== null;
};

export const getCaptchaURL = async (page) => {
  return await page.evaluate(() => {
    const img = document.getElementById("capchaImg");
    return img.src;
  });
};

export const getSlcd = async (page) => {
  return await page.evaluate(() => {
    const hidden_input = document.querySelectorAll(
      ".contents > input[name=slcd]"
    )[0];
    return hidden_input?.value;
  });
};

export const getResult = async (page) => {
  return await page.evaluate(() => {
    const result = document.querySelectorAll(
      "dl.vertical_table:nth-child(2) > dd:nth-child(2)"
    )[0];
    return result.textContent.trim();
  });
};

export const getCaptchaBase64 = async (page) => {
  return await page.evaluate(() => {
    const img = document.getElementById("capchaImg");
    const canvas = document.createElement("canvas");
    if (canvas && img) {
      canvas.width = img.clientWidth;
      canvas.height = img.clientHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      let dataURL = canvas.toDataURL("image/jpeg"); // Use 'image/png' if the image is a PNG
      dataURL = dataURL.replace(/^data:image\/(png|jpeg)base64,/, "");
      return dataURL;
    }
  });
};

export const getLotterySummery = async (page) => {
  return await page.evaluate(() => {
    const dls1 = document.querySelectorAll(
      ".vertical_table.white_back.line_bottom"
    );
    const dls2 = document.querySelectorAll(
      ".vertical_table.white_back.line_top"
    );
    const dls = Array.from(dls1).concat(Array.from(dls2));
    let resultText = "";

    dls.forEach((dl) => {
      const dt = dl.querySelector("dt");
      const dd = dl.querySelector("dd");
      if (dt && dd) {
        resultText += `${dt.textContent
          .trim()
          .replace(/(\r\n|\n|\r)/gm, "")}: ${dd.textContent
          .trim()
          .replace(/(\r\n|\n|\r)/gm, "")}\n`;
      }
    });

    return resultText;
  });
};

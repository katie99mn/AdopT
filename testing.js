//import puppeteer

const puppeteer = require("puppeteer");

async function go() {
  const brower = await puppeteer.launch({
    headless: false,
    slowMo: 50,
  });
}

//go to site to be tested
const page = await brower.newPage();
await page.goto("");

//click on the sign-in button
await page.click("#signinbtn");

//provide email and password to sign in
await page.type("#email2", "test@test.com");
await page.type("#pass2", "test@test.com");

//click on submit button
await page.click("#submit_user_");

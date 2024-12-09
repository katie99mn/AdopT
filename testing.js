//import puppeteer

const puppeteer = require("puppeteer");

async function go() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
  });

  //go to site to be tested
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:5501/public/index.html");

  //click on the burger button
  await page.click("#burger");

  //click on the sign-in button
  await page.click("#signinbtn");

  //provide email and password to sign in
  await page.type("#email2", "test@test.com");
  await page.type("#pass2", "test@test.com");

  //click on submit button
  await page.click("#submit_user_");

  //enforce a 1 second delay
  await new Promise((r) => setTimeout(r, 1000));
  //click on the event page
  await page.click("#events");
  await page.click("#burger");

  await new Promise((r) => setTimeout(r, 1000));

  //click on add event button
  await page.click("#add_btn");

  //provide event details
  await page.type("#event_name", "Test Event");
  await page.type("#event_location", "Business School");
  await page.type("#event_date", "02-24-2025");
  await page.type("#event_time", "2:45PM");
  await page.type("#event_type", "General Meeting");
  await page.type("#event_description", "Join us at this event!");

  //add image
  await page.waitForSelector("#image_upload");
  const inputUploadHandle = await page.$("#image_upload");
  await inputUploadHandle.uploadFile("./indeximages/a1.png");

  //click on the submit button
  await page.click("#event_submit");

  // Listen for dialog (alert) and press OK
  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });
}

//call go
go();

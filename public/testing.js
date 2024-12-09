//import puppeteer

const puppeteer = require("puppeteer");

async function go() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
  });

  //go to site to be tested
  const page = await browser.newPage();
  await page.goto("https://adopt-80f60.web.app/");

  //click on the burger button
  await page.click("#burger");

  //click on the sign-in button
  await page.click("#signinbtn");

  //provide email and password to sign in
  await page.type("#email2", "test@test.com");
  await page.type("#pass2", "test@test.com");

  //click on submit button
  await page.click("#submit_user_");

  //enforce a delay
  await new Promise((r) => setTimeout(r, 5000));

  //upload new upcoming event
  await page.waitForSelector("#upcoming_event_img > label > input");
  const inputUploadHandle1 = await page.$(
    "#upcoming_event_img > label > input"
  );
  await inputUploadHandle1.uploadFile("./indeximages/a1.png");

  // Listen for dialog (alert) and press OK
  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  //enforce a delay
  await new Promise((r) => setTimeout(r, 3000));

  //click on the event page
  await page.click("#burger");
  await page.click("#events");

  await new Promise((r) => setTimeout(r, 2000));

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

  await new Promise((r) => setTimeout(r, 3000));

  //delete test event
  await page.waitForSelector("#all_events > div");
  await page.click(
    "#all_events > div:nth-child(1) > div > div > div > div.column.is-two-thirds > p.is-size-3.darkbrown.has-text-weight-bold > button"
  );
}

//call go
go();

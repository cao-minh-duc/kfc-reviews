const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function extractItems(page) {
    // Click on all elements with the class ".w8nwRe" to expand them
    const expandableElements = await page.$$('.w8nwRe');
    for (const element of expandableElements) {
        await element.click();
        // Wait for animations or content to load (adjust time as necessary)
        await new Promise(r => setTimeout(r, 500))
    }

    // Now extract the reviews
    const reviews = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".jftiEf")).map((el) => {
            return {
                user: {
                    name: el.querySelector(".d4r55")?.textContent.trim(),
                },
                rating: el.querySelector(".kvMYJc")?.getAttribute("aria-label").trim(),
                review: el.querySelector(".wiI7pd")?.textContent.trim() || "",
            };
        });
    });
    return reviews;
}

const scrollPage = async(page, scrollContainer, itemTargetCount) => {
    let items = [];
    let previousHeight = await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight`);
    while (itemTargetCount > items.length) {
        items = await extractItems(page);
        await page.evaluate(`document.querySelector("${scrollContainer}").scrollTo(0, document.querySelector("${scrollContainer}").scrollHeight)`);
        await page.evaluate(`document.querySelector("${scrollContainer}").scrollHeight > ${previousHeight}`);
        await new Promise(r => setTimeout(r, 5000))
    }
    return items;
}

function getPlaceName(url) {
    const matches = url.match(/maps\/place\/([^/]+)\//);
    return matches ? matches[1].replace(/\+/g, ' ') : 'output';
}

const scrapePlaceReviews = async (url) => {
    try {
    browser = await puppeteer.launch({
        args: ["--disabled-setuid-sandbox", "--no-sandbox"],
        headless: false
    });
    const [page] = await browser.pages();

    await page.goto(url, { waitUntil: "domcontentloaded" , timeout: 60000});
    await new Promise(r => setTimeout(r, 3000))

    let data =  await scrollPage(page,'.DxyBCb',300);

    console.log(data);

    const csvString = data.map(review => 
        `"${review.user.name}","${review.rating}","${review.review.replace(/"/g, '""')}"`
    ).join('\n');

    fs.writeFileSync(path.join(__dirname, `${getPlaceName(url)}.csv`), `"Name","Rating","Review"\n${csvString}`);

    await browser.close();
    } catch (e) {
    console.log(e);
    }
};

// Extract URL from the command line arguments
const url = process.argv[2];
scrapePlaceReviews(url);
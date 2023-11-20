import axios from "axios";
import cheerio from "cheerio";
import HttpException from "../exception";
import fs from "fs";
import puppeteer from "puppeteer";

export async function extractLinksFromWebPages(url: string) {
  try {
    // Fetch HTML content of the main page
    const response = await axios.get(url);
    const html = response.data;

    // Use Puppeteer to execute JavaScript and retrieve dynamic content
    const browser = await puppeteer.launch({
      headless: "new",
    });
    
    // Continue with cheerio for server-side HTML parsing
    const $ = cheerio.load(html);

    // Extract all anchor tags
    const links = $("a")
      .map((_, element) => $(element).attr("href"))
      .get()
      .filter(
        (link) =>
          link &&
          !link.includes("https") &&
          link.startsWith("/") &&
          !link.includes("#")
      )
      .slice(0, 5);

    // Fetch links content
    // const urlMap = new Map();
    const _links = [] as any;
    const allLinks = await Promise.all(
      removeDuplicates(links).map(async (link) => {
        const _url = `${url}${link}`;

        const page = await browser.newPage();

        await page.goto(_url, { waitUntil: "domcontentloaded" });

        await sleep(2000);

        const updatedHtml = await page.content();
        const _$ = cheerio.load(updatedHtml);

        // Remove script and style tags
        const invalidTags =
          "script,style,svg,img,path,input,noscript,next-route-announcer,head".split(",");

        invalidTags.forEach((tag) => {
            _$(`${tag}`).remove();
        })

        const validTags = _$("*")
          .not(
            `:is(${invalidTags.join(",")})`
          )
          .filter(
            (_, element) =>
              $(element).html() !== undefined || $(element).text() !== ""
          ); // filter tag if it has html and textContent available

        validTags.each((_, element) => {
          const textContent = $(element)
            .contents() // Get all child nodes
            .map((_, node) => $(node).text()) // Map to text content of each node
            .get() // Convert to array
            .join(" ") // Join the text content
            .trim(); // Trim leading and trailing whitespaces

            _links.push({
                url: _url,
                content: textContent
            })
        //   if (textContent) {
        //     if (urlMap.has(_url)) {
        //       // Append to existing value
        //       urlMap.set(_url, `${urlMap.get(_url)} ${textContent}`);
        //     } else {
        //       // Set initial value
        //       urlMap.set(_url, textContent);
        //     }
        //   }
        });

        // return urlMap
      })
    );

    await browser.close();

    // extract non duplicate links if exists
    const nonDuplicateLinks = _links.filter(
        (link: any, index: number, self: any) =>
            index === self.findIndex((t: any) => t.url === link.url)
        );


    // loop through all links and create a new array
    // allLinks.forEach((link) => {
    //   link.forEach((value, key) => {
    //     const linkexits = _links.find((l : any) => l?.url === key);
    //     if (!linkexits) {
    //       // append to existing value
    //       _links.push({ url: key, content: value });
    //     }
    //   });
    // });

    return {
        links: nonDuplicateLinks,
        rawData: _links
    };
  } catch (error) {
    console.error("Error:", error);
    throw new HttpException(
      "Error extracting links",
      "EXTRACT_LINKS_ERROR",
      400
    );
  }
}

function removeDuplicates(array: any[]) {
  return array.filter((a, b) => array.indexOf(a) === b);
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

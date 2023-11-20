import axios from "axios";
import cheerio from "cheerio";
import HttpException from "../exception";

export async function extractLinksFromWebPages(url: string) {
  try {
    // Fetch HTML content of the main page
    const response = await axios.get(url);
    const html = response.data;

    // Use cheerio for server-side HTML parsing
    const $ = cheerio.load(html);

    // Get the visible text content of the main page
    const mainPageText = $("body").text();

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
      ).slice(0, 6);

    // Fetch links content
    const allLinks = await Promise.all(
      removeDuplicates(links).map(async (link) => {
        const linkResponse = await axios.get(`${url}${link}`);
        const linkHtml = linkResponse.data;

        // Use cheerio for server-side HTML parsing of link content
        const link$ = cheerio.load(linkHtml);
        const linkText = link$("body").text();

        return {
          link: `${url}${link}`,
          text: linkText,
        };
      })
    );

    return allLinks;
  } catch (error) {
    throw new HttpException("Error extracting links", "EXTRACT_LINKS_ERROR", 400);
    return [];
  }
}

function removeDuplicates(array: any[]) {
  return array.filter((a, b) => array.indexOf(a) === b);
}

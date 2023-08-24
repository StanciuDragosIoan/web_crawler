const axios = require('axios');
const fs = require('fs');


const filePath = "sample-websites-company-names.csv";
const inputFilePath = "sample-websites.csv";

const getUrls = () => {
    const data = fs.readFileSync(inputFilePath, "utf-8");
    return data.trim().split("\r\n");
}

// const urls = getUrls().filter(i => i !== "domain").map(i => `https://${i}`);

const urls = [
    "https://logrocket.com/blog",
    // "https://bostonzen.org", "https://mazautoglass.com",
    // "https://melatee.com", "timent.com"
    // Add more URLs as needed
];


const extractLinks = (html) => {
    // get anchor tags
    const anchorTagRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g;
    const links = [];
    let match;
    while ((match = anchorTagRegex.exec(html)) !== null) {
        //url matched
        const link = match[2];
        links.push(link);
    }

    return links;

}



function extractContents(html) {

    // Extract phone numbers
    const phoneRegex = /\b\d{3}-\d{3}-\d{4}\b/g;
    const phoneMatches = html.match(phoneRegex);
    console.log('Phone Numbers:', phoneMatches);

    // Extract company names
    const companyRegex = /<title>(.*?)<\/title>/;
    const companyMatch = html.match(companyRegex);
    const companyName = companyMatch ? companyMatch[1] : '';

    // Extract domain
    const domainRegex = /https?:\/\/(?:www\.)?([^/]+)\//i;
    const domainMatch = html.match(domainRegex);
    const domain = domainMatch ? domainMatch[1] : '';


    // Check if the extracted company name contains common unwanted patterns
    const unwantedPatterns = ['Customer Reviews', 'Contact Us', "Author at"];
    const filteredCompanyNames = unwantedPatterns.reduce(
        (filtered, pattern) => filtered.replace(pattern, '').trim(),
        companyName
    );


    // Extract social media links  
    const socialMediaRegex = /href=["'](https?:\/\/(?:www\.)?(?:facebook|twitter|linkedin)\.[a-z\.]+)/g;
    const socialMediaMatches = html.match(socialMediaRegex);


    // Extract address/location information  
    const addressRegex = /(?:[A-Z][a-z]+,\s*){2,}[A-Z][a-z]+/g;
    const addressMatches = html.match(addressRegex);

    //write to file
    const newRow = [
        `${domain}`,
        `${filteredCompanyNames}`,
        `${filteredCompanyNames}`,
        `${filteredCompanyNames}`,
        `${socialMediaMatches}`,
        `${phoneMatches}`,
        `${addressMatches}`
    ];

    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const lines = rawContent.trim().split('\n');
    const newLines = [...lines, newRow.join(",")];
    const csvContent = newLines.join('\n');

    fs.writeFileSync(filePath, csvContent)

}



async function fetchData(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error.message);
        return null;
    }
}


const getFullData = () => {
    const fileData = JSON.parse(fs.readFileSync("responses.json"));
    fileData.map(i => {
        const { url } = i;
        i.links.map(async (l) => {
            const data = await fetchData(l);
            // console.log("data here", data)
            if (data) {
                extractContents(data);
            }

        })
    })
}

const addNewColumnsToFile = () => {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const lines = rawContent.trim().split('\n');
    const columns = lines[0].split(',');

    const newColumns = ["social_links", "phone", "address"];
    const allColumns = [...columns, ...newColumns];
    const updatedHeaderRow = allColumns.join(',');
    lines[0] = updatedHeaderRow;
    const updatedContent = lines.join('\n');
    fs.writeFileSync(filePath, updatedContent);
}


async function main() {
    const responseData = [];
    addNewColumnsToFile();


    for (const url of urls) {
        const data = await fetchData(url);
        const links = extractLinks(data);
        if (data) {
            responseData.push({ url, links });
        }


    }

    const jsonFilePath = 'responses.json';

    fs.writeFile(jsonFilePath, JSON.stringify(responseData, null, 2), (err) => {
        if (err) {
            console.error('Error writing JSON file:', err);
        } else {
            console.log(`Responses written to ${jsonFilePath}`);
            getFullData();
        }
    });



}

main();

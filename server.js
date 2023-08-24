const axios = require('axios');
const fs = require('fs');

const getUrls = () => {
    const data = fs.readFileSync("sample-websites.csv", "utf-8");
    return data.trim().split("\r\n");
}

// const urls = getUrls().filter(i => i !== "domain").map(i => `https://${i}`);

const urls = [
    "https://logrocket.com/blog",
    // "https://bostonzen.org", "https://mazautoglass.com",
    // "https://melatee.com", "timent.com"
    // Add more URLs as needed
];

function extractLinksAndContent(html) {
    // get anchor tags
    const anchorTagRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g;
    const links = [];
    let match;
    while ((match = anchorTagRegex.exec(html)) !== null) {
        const link = match[2];
        links.push(link);
    }

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


    // Extract address/location information (simple pattern matching)
    const addressRegex = /(?:[A-Z][a-z]+,\s*){2,}[A-Z][a-z]+/g;
    const addressMatches = html.match(addressRegex);

    //write to file
    const newRow = [
        `${domain}`, // Replace with actual domain
        `${filteredCompanyNames}`,
        `${filteredCompanyNames}`,
        `${filteredCompanyNames}`,
        `${socialMediaMatches}`, // Update with actual links
        `${phoneMatches}`, // Update with actual phone number
        `${addressMatches}` // Update with actual address
    ];

    // Extract data using regular expressions and store in entries array
    const entries = [];


    const row = ["someDomain22", "testcompany_commercial_name", "test2company_legal_name", "testcompany_all_available_names", "test/facebook.com", "123123123", "someStreet"];

    const rawContent = fs.readFileSync('testWrite.csv', 'utf-8');
    const lines = rawContent.trim().split('\n');
    const newLines = [...lines, newRow.join(",")];
    const csvContent = newLines.join('\n');

    fs.writeFileSync("testWrite.csv", csvContent)



    const output = {
        companyName: filteredCompanyNames,
        links: links.filter(i => i !== '/').filter(i => i !== '#').slice(0, 15),
        socialLinks: socialMediaMatches,
        phone: phoneMatches,
        adress: addressMatches
    }

    return output;
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
                const {
                    companyName,
                    links,
                    socialLinks,
                    phone,
                    adress
                } = extractLinksAndContent(data);

            }

        })
    })
}

const addNewColumnsToFile = () => {
    const rawContent = fs.readFileSync('testWrite.csv', 'utf-8');
    const lines = rawContent.trim().split('\n');
    const columns = lines[0].split(',');

    const newColumns = ["social_links", "phone", "address"];
    const allColumns = [...columns, ...newColumns];
    const updatedHeaderRow = allColumns.join(',');
    lines[0] = updatedHeaderRow;
    const updatedContent = lines.join('\n');
    fs.writeFileSync('testWrite.csv', updatedContent);
}


async function main() {
    const responseData = [];
    addNewColumnsToFile();


    for (const url of urls) {
        const data = await fetchData(url);
        const { links } = extractLinksAndContent(data, url)
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

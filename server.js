
const Xray = require('x-ray');
const cheerio = require('cheerio');
const x = Xray();

const csv = require('fast-csv');




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
    // Simple regex to match anchor tags
    const anchorTagRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g;
    const links = [];
    let match;
    while ((match = anchorTagRegex.exec(html)) !== null) {
        const link = match[2];
        links.push(link);
        // You can process the link here

    }

    // Extract phone numbers (simple pattern matching)
    const phoneRegex = /\b\d{3}-\d{3}-\d{4}\b/g;
    const phoneMatches = html.match(phoneRegex);
    console.log('Phone Numbers:', phoneMatches);

    // Extract company names(simple pattern matching)
    const companyRegex = /<title>(.*?)<\/title>/;
    const companyMatch = html.match(companyRegex);
    const companyName = companyMatch ? companyMatch[1] : '';
    console.log('Company Name:', companyName);

    // Check if the extracted company name contains common unwanted patterns
    const unwantedPatterns = ['Customer Reviews', 'Contact Us', "Author at"];
    const filteredCompanyNames = unwantedPatterns.reduce(
        (filtered, pattern) => filtered.replace(pattern, '').trim(),
        companyName
    );

    console.log('Company Name:', filteredCompanyNames);
    // Extract social media links (simple pattern matching)
    const socialMediaRegex = /href=["'](https?:\/\/(?:www\.)?(?:facebook|twitter|linkedin)\.[a-z\.]+)/g;
    const socialMediaMatches = html.match(socialMediaRegex);
    console.log('Social Media Links:', socialMediaMatches);

    // Extract address/location information (simple pattern matching)
    const addressRegex = /(?:[A-Z][a-z]+,\s*){2,}[A-Z][a-z]+/g;
    const addressMatches = html.match(addressRegex);
    console.log('Address/Location:', addressMatches);


    //write to file
    const extractedData = {
        domain: 'example.com', // Replace with actual domain
        company_commercial_name: 'Commercial Name',
        company_legal_name: 'Legal Name',
        company_all_available_names: 'All Available Names',
        social_links: 'Social Links', // Update with actual links
        phone: 'Phone Number', // Update with actual phone number
        address: 'Address' // Update with actual address
    };

    // Extract data using regular expressions and store in entries array
    const entries = [];


    //THIS PART DOES NOT WORK!
    const csvFilePath = "toWrite.csv"

    const csvStream = csv.format({ headers: true });
    const writeStream = fs.createWriteStream(csvFilePath, { flags: 'a' });
    csvStream.pipe(writeStream);

    entries.forEach(entry => {
        const mergedEntry = { ...extractedData, ...entry };
        csvStream.write(mergedEntry);
    });

    csvStream.end();
    console.log('Data appended to CSV:', csvFilePath);

    // fs.createReadStream("toWrite.csv")
    //     .pipe(csv())
    //     .on('data', (row) => existingRows.push(row))
    //     .on('end', () => {
    //         // Add the extracted data to the existing rows
    //         existingRows.push(extractedData);

    //         // Write the combined data back to the CSV file
    //         const combinedCSVData = existingRows.map(row => ({

    //             ...extractedData,
    //             ...row,
    //         }));

    //         const csvWriter = fs.createWriteStream("toWrite.csv");
    //         csvWriter.write(Object.keys(combinedCSVData[0]).join(',') + '\n');
    //         combinedCSVData.forEach(data => {
    //             csvWriter.write(Object.values(data).join(',') + '\n');
    //         });
    //         csvWriter.end();

    //         console.log('Data written to CSV file:', "toWrite.csv");
    //     });





    // fs.writeFileSync("testWrite.csv", JSON.stringify(dummyData))



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


async function main() {
    const responseData = [];

    for (const url of urls) {
        const data = await fetchData(url);
        const { links } = extractLinksAndContent(data)
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

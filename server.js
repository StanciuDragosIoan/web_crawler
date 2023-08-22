// // const express = require("express");
// import express from "express";
// // const fs = require("fs");
// import fs from "fs";
const Xray = require('x-ray');
// import Xray from "x-ray";
const x = Xray();
// import got from 'got';




// const app = express();


const crawlWebsite = async (url) => {
    return x(url, {
        links: ['a']
    })(async (err, result) => {

        // console.log('fetching url2', url)
        // console.log("this calls!")
        // result.titles.forEach(title => console.log(`- ${title}`));

        // if (!fs.existsSync("raw_data.json")) {
        //     await fs.writeFileSync("raw_data.json", "utf-8")
        // }


        try {
            const processedResult = {
                domain: url,
                links: result.links.map(i => {
                    return i.toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                }).filter(q => q !== "").slice(0, 10)
            }

            const fileData = await fs.readFileSync("raw_data.json", "utf-8");

            let actualData = { sites: [] };
            try {
                actualData.sites = JSON.parse(fileData).sites;
            } catch (err) {
                console.log("err here")
            }



            const isDuplicate = actualData.sites.find(i => i.domain === url);

            if (!isDuplicate) {
                actualData.sites.push(processedResult);
            }




            // return actualData;
            return processedResult;
        } catch (err) {
            return {}

        }




    });


}


// const yourArray = ["https://logrocket.com/blog", "https://bostonzen.org"];

// async function run() {
//     for (let [index, item] of yourArray.entries()) {
//         try {
//             let result = await got(item.url);
//             console.log("cacat")
//             console.log(result)
//             // console.
//             await crawlWebsite(item);
//             // do something with the result
//         } catch (e) {
//             // either handle the error here or throw to stop further processing
//         }
//     }
// }


// run().then(() => {
//     console.log("all done");
// }).catch(err => {
//     console.log(err);
// });


// const getUrls = async () => {
//     const data = await fs.readFileSync("sample-websites.csv", "utf-8");
//     return data.split("\n").map(i => i.split("\r").filter(q => q !== ""))
// }

const getUrls = () => {
    const data = fs.readFileSync("sample-websites.csv", "utf-8");
    return data.trim().split("\r\n");
}






// // // const customMiddleware = (customParam) => {
// // //     return (req, res, next) => {
// // //         // You can access the customParam here
// // //         console.log("Custom parameter:", customParam);

// // //         // Your middleware logic here

// // //         // Call next() to pass control to the next middleware/route handler
// // //         next();
// // //     };
// // // };

// // // app.get('/', customMiddleware("Hello from middleware"), (async (req, res, next) => {
// // app.get('/', (async (req, res) => {

// //     // const urls = ["https://logrocket.com/blog", "https://bostonzen.org", "https://mazautoglass.com"]
// //     // const urls = ["https://logrocket.com/blog", "https://bostonzen.org"];

// //     const { url } = req.query;

// //     console.log("URL", url)
// //     await crawlWebsite(url)





// //     return res.send("cacat")



// // }));


// // app.get("/getData", (req, res) => {
// //     const urls = ["https://logrocket.com/blog", "https://bostonzen.org"];

// //     for (i = 0; i < urls.length; i++) {
// //         crawlWebsite(urls[i])
// //     }

// //     return res.end("test")
// //     // return axios.get("http://localhost:3000/?url=https://logrocket.com/blog")
// // });





// app.listen(3000)

const axios = require('axios');
const fs = require('fs');

const urls = getUrls().filter(i => i !== "domain").map(i => `https://${i}`).slice(0, 100);

// console.log(urls[0]);
// console.log(urls[1]);
// console.log(urls[2]);
// console.log(urls[3]);
// console.log(urls[4]);

// console.log("urls2", urls2)

// const urls = [
//     "https://logrocket.com/blog", "https://bostonzen.org", "https://mazautoglass.com",
//     "https://melatee.com", "timent.com"
//     // Add more URLs as needed
// ];

// async function fetchData(url) {
//     try {
//         const response = await axios.get(url);
//         return response.data;
//     } catch (error) {
//         console.error(`Error fetching data from ${url}:`, error.message);
//         return null;
//     }
// }

async function fetchData(url) {
    try {
        const response = await crawlWebsite(url)
        console.log("RESPONSE HERE", response)
        return response;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error.message);
        return null;
    }
}

async function main() {
    const responseData = [];

    for (const url of urls) {
        const data = await fetchData(url);
        if (data) {
            responseData.push({ url, data });
        }
    }

    const jsonFilePath = 'responses.json';

    fs.writeFile(jsonFilePath, JSON.stringify(responseData, null, 2), (err) => {
        if (err) {
            console.error('Error writing JSON file:', err);
        } else {
            console.log(`Responses written to ${jsonFilePath}`);
        }
    });
}

main();
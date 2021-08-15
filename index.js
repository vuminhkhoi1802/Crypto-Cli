'use strict';
require('dotenv').config();
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const _ = require('lodash');

const {
	TOKENS,
	DATE_FORMAT_YYYY_MM_DD,
} = require('./utils/consts');

const {
	getPortfolioByDateAndToken,
	getPortfoliosByDate,
	getLatestPortfolioByToken,
	getActualPortFolioForAllTokens,
} = require('./CryptoPortfolio/CryptoPortfolio');


const results = [];

const fileStream = fs.createReadStream(path.resolve(__dirname, 'data', 'transactions.csv'));
const endFileStream = new Promise((resolve, reject) => {
	fileStream.pipe(csv.parse({headers: true}))
		.on('error', error => reject(error))
		.on('data', row => {
			const rowCopy = Object.assign({}, row);
			row.timestamp = Number(rowCopy.timestamp);
			row.amount = parseFloat(rowCopy.amount);
			results.push(row);
			console.log(`Processed ${JSON.stringify(row)}`)
		}).on('end', rowCount => {
		console.log(`Parsed ${rowCount} rows`);
		resolve(rowCount);
	})
});

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// MAIN EXECUTION STARTS HERE
(async function () {
	console.log('================ WELCOME TO KHOI VU CRYPTO CLI ===================');
	console.log('================ PLEASE WAIT FOR PARSING THE CSV FILE ============');
	await endFileStream;
	console.log('================ END OF PARSING THE PROVIDED CSV FILE ============');
	const portfolios = await getActualPortFolioForAllTokens(results);
	console.log('================ HERE ARE THE LATEST PORTFOLIOS BY TOKENS=========');
	console.log(portfolios);
	rl.question("Please specify your token of choice (ETH, BTC, XRP) to get the latest Portfolio: ", async (token) => {
		if (token && token.length === 3 && TOKENS.includes(token.toUpperCase())) {
			const latestPortfolioByToken = await getLatestPortfolioByToken(token.toUpperCase(), results);
			console.log(`HERE IS THE LATEST PORTFOLIO BY ${token.toUpperCase()}: \n ${JSON.stringify(latestPortfolioByToken)}`);
		}
		rl.question('Please specify a date in YYYY-MM-DD to get Portfolios by per token: ', async (date) => {
			if (date && date.match(DATE_FORMAT_YYYY_MM_DD)) {
				const portfoliosByGivenDate = await getPortfoliosByDate(date, results);
				if (portfoliosByGivenDate.length === 0) {
					console.log('================ SORRY THERE WERE NO RESULTS YOU WERE LOOKING FOR =========\n')
					rl.close();
				}
				console.log(`================ HERE ARE THE PORTFOLIOS BY INPUT DATE ${date} =========\n`);
				console.log(portfoliosByGivenDate);
				if (portfoliosByGivenDate.length > 0) {
					rl.question('Please specify a token after providing the date previously: ', async (token) => {
						const portfoliosByGivenDateAndToken = await getPortfolioByDateAndToken(date, token.toUpperCase(), results);
						if (portfoliosByGivenDateAndToken) {
							console.log(`================ HERE IS THE PORTFOLIO BY INPUT DATE ${date} AND TOKEN ${token}=========\n`);
							console.log(portfoliosByGivenDateAndToken);
							rl.close();
						} else {
							console.log('================ SORRY THERE WERE NO RESULTS YOU WERE LOOKING FOR =========\n')
							rl.close();
						}
					});
				}
			}
		});
	});


	rl.on("close", function () {
		console.log("\n================ THANK YOU FOR USING KHOI VU CRYPTO CLI=========");
		process.exit(0);
	});
}());



'use strict';
require('dotenv').config();
const _ = require('lodash');
const axios = require('axios');
const {
	maxObjectValueInArray,
	calculatePortfolioBalance,
	convertDateToTimeStamp,
	sumOfObjectsValuesInArray,
	roundNumberTo2Digits,
} = require('../utils/utils');
const {
	DEPOSIT,
	WITHDRAWAL,
	CURRENCIES,
} = require('../utils/consts');


const getCryptoPriceInUSDByToken = async (token) => {
	try {
		const baseURL = process.env.BASE_URL;
		const response = await axios.get(`${baseURL}/data/price?fsym=${token}&tsyms=${CURRENCIES.USD}`);
		return response.data[CURRENCIES.USD];
	} catch ({message}) {
		console.log(message);
	}
}

const getPortfolioByDateAndToken = async (date, token, data) => {
	const priceInUSDByToken = await getCryptoPriceInUSDByToken(token);
	const dateBeginning = date.concat(' 00:00:00');
	const dateEnd = date.concat(' 23:59:59');
	const dateBeginningInTimeStamp = convertDateToTimeStamp(dateBeginning);
	const dateEndInTimeStamp = convertDateToTimeStamp(dateEnd);
	const depositData = _.filter(data, (record) => {
		return record.timestamp > dateBeginningInTimeStamp &&
			record.timestamp < dateEndInTimeStamp &&
			record.token === token &&
			record.transaction_type === DEPOSIT
	});
	const withdrawData = _.filter(data, (record) => {
		return record.timestamp > dateBeginningInTimeStamp &&
			record.timestamp < dateEndInTimeStamp &&
			record.token === token &&
			record.transaction_type === WITHDRAWAL
	});
	if (depositData.length > 0 && withdrawData.length > 0) {
		const sumOfDeposit = sumOfObjectsValuesInArray(depositData, 'amount');
		const sumOfWithdrawal = sumOfObjectsValuesInArray(withdrawData, 'amount');
		const balance = roundNumberTo2Digits(priceInUSDByToken * (sumOfDeposit - sumOfWithdrawal));
		return {
			token,
			balance,
			unit: CURRENCIES.USD,
		}
	} else {
		return null;
	}
}

const getPortfoliosByDate = async (date, data) => {
	const tokenArr = getTokensSetFromData(data);
	const portfolios = [];
	for (let i = 0; i < tokenArr.length; i++) {
		const portfolioByDateAndToken = await getPortfolioByDateAndToken(date, tokenArr[i], data);
		if (portfolioByDateAndToken) {
			portfolios.push(portfolioByDateAndToken);
		}
	}
	return portfolios;
}

const getTokensSetFromData = (data) => {
	const tokens = new Set([...data.map(record => record.token)]);
	return [...tokens];
}

const getLatestPortfolioByToken = async (token, data) => {
	const priceInUSDByToken = await getCryptoPriceInUSDByToken(token);
	const depositData = _.filter(data, {
		'transaction_type': DEPOSIT,
		'token': token,
	});
	const latestDepositTransaction = maxObjectValueInArray(depositData, 'time_stamp');
	const withdrawData = _.filter(data, {
		'transaction_type': WITHDRAWAL,
		'token': token,
	})
	const latestWithdrawTransaction = maxObjectValueInArray(withdrawData, 'time_stamp');
	const balance =
		calculatePortfolioBalance(priceInUSDByToken, latestDepositTransaction.amount, latestWithdrawTransaction.amount);
	return {
		token: token,
		balance,
		unit: CURRENCIES.USD,
	}
};

const getActualPortFolioForAllTokens = async (data) => {
	const tokensArr = getTokensSetFromData(data);
	const portfolios = [];
	for (let i = 0; i < tokensArr.length; i++) {
		const portfolioByToken = await getLatestPortfolioByToken(tokensArr[i], data);
		portfolios.push(portfolioByToken);
	}
	return portfolios;
}

module.exports = {
	getPortfolioByDateAndToken,
	getPortfoliosByDate,
	getLatestPortfolioByToken,
	getActualPortFolioForAllTokens,
}

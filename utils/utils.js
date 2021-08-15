'use strict';
const moment = require('moment');

const roundNumberTo2Digits = (num) => Math.round(num * 100) / 100;

const maxObjectValueInArray = (array, key) => {
	return array.reduce((max, obj) => (max[key] > obj[key]) ? max : obj);
}

const calculatePortfolioBalance = (unitPrice, deposit, withdrawal) => {
	return roundNumberTo2Digits(unitPrice * (deposit - withdrawal));
}

const convertDateToTimeStamp = (date) => {
	return parseInt(moment(date).format('X'));
}

const sumOfObjectsValuesInArray = (array, key) => {
	return array.reduce((acc, current) => acc + current[key], 0);
}

module.exports = {
	roundNumberTo2Digits,
	maxObjectValueInArray,
	calculatePortfolioBalance,
	convertDateToTimeStamp,
	sumOfObjectsValuesInArray,
}

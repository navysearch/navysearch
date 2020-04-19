
export const isNotNumber = value => isNaN(Number(value));
export const isNumberLike = value => !isNaN(Number(value));
export const createMessageId = ({type, year, num}) => `${type}${year}${num}`;
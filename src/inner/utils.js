import immutable from 'immutable';

export const isNumber = val => typeof val === 'number';
export const isString = val => typeof val === 'string';
export const isBoolean = val => val === true || val === false;
export const isArray = val => val instanceof Array;
export const isObject = val => !!val && typeof val === 'object';
export const isImmutableList = val => val instanceof immutable.List;
export const isImmutableRecord = val => val instanceof immutable.Record;

export function arrayToMap(arr, getKey = null) {
    if (isString(getKey)) {
        getKey = item => item[getKey];
    }
    return arr.reduce((result, item) => {
        result[getKey ? getKey(item) : item] = true;
        return result;
    }, {});
}
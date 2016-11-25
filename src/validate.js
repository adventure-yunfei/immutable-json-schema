import immutable from 'immutable';
import some from 'lodash/some';
import {SchemaTypes, getSchemaType} from './schema-types';

const isNumber = val => typeof val === 'number';
const isString = val => typeof val === 'string';
const isBoolean = val => val === true || val === false;
const isArray = val => val instanceof Array;
const isObject = val => !!val && typeof val === 'object';
const isImmutableList = val => val instanceof immutable.List;
const isImmutableRecord = val => val instanceof immutable.Record;

function validateSchemaProperties(schemaProperties, requiredProps, data, _keyPath) {
    const requiredMap = {};
    requiredProps.forEach(prop => requiredMap[prop] = true);
    let errMsg = '';
    some(schemaProperties, (propSchema, propKey) => {
        const propData = data[propKey];
        if (!requiredMap[propKey] && propData == null) {
            // pass
        } else {
            errMsg = validate(propSchema, propData, `${_keyPath}.${propKey}`);
            return !!errMsg;
        }
    });
    return errMsg;
};

function validate(schema, data, _keyPath = '') {
    let valid = false,
        buildErrMsg = expectedMsg => `Path: "${_keyPath}"; ${expectedMsg}; Actual value: ${JSON.stringify(data.toJS ? data.toJS() : data)}`,
        errMsg = '';
    switch (getSchemaType(schema)) {
        case SchemaTypes.TYPE_NUMBER:
            valid = isNumber(data);
            break;
        case SchemaTypes.TYPE_STRING:
            valid = isString(data);
            break;
        case SchemaTypes.TYPE_BOOLEAN:
            valid = isBoolean(data);
            break;
        case SchemaTypes.TYPE_ARRAY:
            if (isArray(data) || isImmutableList(data)) {
                const itemSchema = schema.items;
                valid = data.every((item, idx) => {
                    const errMsg = validate(itemSchema, item, `${_keyPath}[${idx}]`);
                    return !errMsg;
                });
            }
            break;
        case SchemaTypes.TYPE_OBJECT:
            if (isImmutableRecord(data) || (isObject(data) && !isArray(data))) {
                errMsg = validateSchemaProperties(schema.properties, schema.required || [], data);
                valid = !errMsg;
            }
            break;
        case SchemaTypes._TYPE_ENUM:
            valid = schema.enum.indexOf(data) !== -1;
            errMsg = valid ? '' : buildErrMsg(`Expected enum of: ${JSON.stringify(schema.enum)}`);
            break;
        case SchemaTypes._TYPE_ANYOF: {
            const errors = [];
            valid = schema.anyOf.some(optSchema => {
                const err = validate(optSchema, data, _keyPath);
                errors.push(err);
                return !err;
            });
            errMsg = valid ? '' : `Path: ${_keyPath}; "anyOf" all option schemas failed, each error is:\n`
                + errors.map((err, idx) => `  ${idx+1}: ${err}\n`).join('');
            break;
        }
    }

    return valid ? '' : (errMsg || buildErrMsg(`Expected type: "${schema.type}"`));
}

// validate schema, and throw error if failed.
function ensureSchema(schema, data) {
    const err = validate(schema, data);
    if (err !== '') {
        throw new Error(`Schema validation Failed, Schema:(${schema.title || ''}), Error: ${err}`);
    }
}


export {
    validate,
    ensureSchema
}
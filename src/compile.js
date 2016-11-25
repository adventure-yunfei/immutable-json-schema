import omit from 'lodash/omit';
import mapValues from 'lodash/mapValues';
import values from 'lodash/values';
import {SchemaTypes, getSchemaType} from './schema-types';

const isString = val => typeof val === 'string';
const isArray = val => val instanceof Array;
const isObject = val => !!val && typeof val === 'object';

function compileStringSchemaDef(strSchemaDef) {
    const [type, ...options] = strSchemaDef.split('|'),
        schema = {type: type.trim()};
    options.forEach(option => {
        const [key, val] = option.split(':');
        schema[key.trim()] = JSON.parse(val.trim());
    });
    return schema;
}

function compileSimpleSyntaxSchemaDef(simpleSchemaDef) {
    return {
        type: SchemaTypes.TYPE_OBJECT,
        properties: mapValues(omit(simpleSchemaDef, ['__options']), compile)
    };
}


function compile(schemaDefinition) {
    let compiledSchema = null;
    if (isString(schemaDefinition)) {
        compiledSchema = compileStringSchemaDef(schemaDefinition);
    } else if (isArray(schemaDefinition)) {
        if (schemaDefinition.length !== 1) {
            throw new Error('compile: schema def of array must contain one and only one item: ' + JSON.stringify(schemaDefinition));
        }
        compiledSchema = {
            type: SchemaTypes.TYPE_ARRAY,
            items: compile(schemaDefinition[0])
        };
    } else if (isObject(schemaDefinition)) {
        if (schemaDefinition.__compiled) {
            compiledSchema = schemaDefinition;
        } else {
            compiledSchema = compileSimpleSyntaxSchemaDef(schemaDefinition);
        }
    } else {
        throw new Error('compile: schema definition invalid. Only support string/array/object format: ' + JSON.stringify(schemaDefinition));
    }

    compiledSchema.__compiled = true;

    return compiledSchema;
}

function compileEnum(enums) {
    return compile({
        __compiled: true,
        enum: isArray(enums) ? enums : values(enums)
    });
}

function compileAnyOf(possibleSchemas) {
    return compile({
        __compiled: true,
        anyOf: possibleSchemas.map(compile)
    });
}

export {
    compile,
    compileEnum,
    compileAnyOf
}

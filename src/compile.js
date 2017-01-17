import omit from 'lodash/omit';
import mapValues from 'lodash/mapValues';
import difference from 'lodash/difference';
import keys from 'lodash/keys';
import assign from 'lodash/assign';
import values from 'lodash/values';
import {SchemaTypes} from './inner/schema-types';
import {getConfig} from './config';

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
    return assign({
        type: SchemaTypes.TYPE_OBJECT,
        properties: mapValues(omit(simpleSchemaDef, ['__options']), compile)
    }, simpleSchemaDef.__options || {});
}

function compileRawSyntaxSchema(rawSchemaDef) {
    const setupForRawSubSchema = subSchema => compile(assign(subSchema, {__raw: true})),
        compiledSchema = rawSchemaDef;
    compiledSchema.items && (compiledSchema.items = setupForRawSubSchema(compiledSchema.items));
    compiledSchema.properties && (compiledSchema.properties = mapValues(compiledSchema.properties, setupForRawSubSchema));
    compiledSchema.anyOf && (compiledSchema.anyOf = compiledSchema.anyOf.map(setupForRawSubSchema));
    return compiledSchema;
}

function compile(schemaDefinition) {
    let compiledSchema = null;
    if (schemaDefinition.__compiled) {
        return schemaDefinition;
    } else if (isString(schemaDefinition)) {
        compiledSchema = compileStringSchemaDef(schemaDefinition);
    } else if (isArray(schemaDefinition)) {
        if (schemaDefinition.length !== 1 && schemaDefinition.length !== 2) {
            throw new Error('compile: schema def of array must contain one or two item: ' + JSON.stringify(schemaDefinition));
        }
        const itemSchema = schemaDefinition[0],
            options = schemaDefinition[1] && schemaDefinition[1].__options || {};
        compiledSchema = assign({
            type: SchemaTypes.TYPE_ARRAY,
            items: compile(itemSchema)
        }, options);
    } else if (isObject(schemaDefinition)) {
        if (schemaDefinition.__raw) {
            compiledSchema = compileRawSyntaxSchema(schemaDefinition);
        } else {
            compiledSchema = compileSimpleSyntaxSchemaDef(schemaDefinition);
        }
    } else {
        throw new Error('compile: schema definition invalid. Only support string/array/object format: ' + JSON.stringify(schemaDefinition));
    }

    const config = getConfig();
    if (!compiledSchema.required) {
        if (compiledSchema.notRequired) {
            compiledSchema.required = difference(keys(compiledSchema.properties), compiledSchema.notRequired);
        } else if (config.defaultRequired) {
            compiledSchema.required = keys(compiledSchema.properties);
        }
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

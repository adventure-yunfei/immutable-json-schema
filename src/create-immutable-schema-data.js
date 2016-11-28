import immutable from 'immutable';
import find from 'lodash/find';
import pick from 'lodash/pick';
import keys from 'lodash/keys';
import mapValues from 'lodash/mapValues';
import {SchemaTypes, getSchemaType} from './inner/schema-types';
import {validate, ensureSchema} from './validate';
import {getObjectSchemaRecord} from './inner/get-object-schema-record';

function _innerCreateImmutableSchemaData(schema, data) {
    if (data == null) {
        return null;
    }
    switch (getSchemaType(schema)) {
        case SchemaTypes.TYPE_NUMBER:
        case SchemaTypes.TYPE_STRING:
        case SchemaTypes.TYPE_BOOLEAN:
        case SchemaTypes._TYPE_ENUM:
            return data;
        case SchemaTypes.TYPE_ARRAY:
            return immutable.List(data.map(item => _innerCreateImmutableSchemaData(schema.items, item)));
        case SchemaTypes.TYPE_OBJECT:
            return new (getObjectSchemaRecord(schema))(mapValues(schema.properties, (propSchema, propKey) => {
                return _innerCreateImmutableSchemaData(propSchema, data[propKey]);
            }));
        case SchemaTypes._TYPE_ANYOF:
            return _innerCreateImmutableSchemaData(
                find(schema.anyOf, optSchema => validate(optSchema, data) === ''),
                data
            );
        default:
            throw new Error(`_innerCreateImmutableSchemaData: Schema type not supported: ${getSchemaType(schema)}`);
    }
}

function _createObjectSchemaPartialData(schema, partialData) {
    return mapValues(pick(schema.properties, keys[partialData]), (propSchema, propKey) => {
        return _innerCreateImmutableSchemaData(propSchema, partialData[propKey]);
    });
}

function createImmutableSchemaData(schema, data) {
    if (data == null) {
        return null;
    }
    ensureSchema(schema, data);
    return _innerCreateImmutableSchemaData(schema, data);
}

function mergeImmutableSchemaData(schema, immutableSchemaData, mergedData) {
    const schemaType = getSchemaType(schema);
    if (schemaType === SchemaTypes.TYPE_OBJECT) {
        ensureSchema(schema, mergedData, true);
        return immutableSchemaData.merge(_createObjectSchemaPartialData(schema, mergedData));
    } else if (schemaType === schemaType !== SchemaTypes._TYPE_ANYOF) {
        const tgtSchema = find(schema.anyOf, optSchema => validate(optSchema, immutableSchemaData) === '');
        return mergeImmutableSchemaData(tgtSchema, immutableSchemaData, mergedData);
    } else {
        throw new Error(`mergeImmutableSchemaData: Only support "object" or "anyOf" schema, actual type: ${schemaType}`);   
    }
}

export {
    createImmutableSchemaData,
    mergeImmutableSchemaData
}

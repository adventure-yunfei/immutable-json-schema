import immutable from 'immutable';
import find from 'lodash/find';
import mapValues from 'lodash/mapValues';
import {SchemaTypes, getSchemaType} from './schema-types';
import {validate, ensureSchema} from './validate';

function getObjectSchemaRecord(schema) {
    if (!schema.__record) {
        const recordOptions = mapValues(schema.properties, () => null);
        schema.__record = new immutable.Record(recordOptions, `SchemaRecord[${schema.title || ''}]`);
    }
    return schema.__record;
}

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

function createImmutableSchemaData(schema, data) {
    if (data == null) {
        return null;
    }
    ensureSchema(schema, data);
    return _innerCreateImmutableSchemaData(schema, data);
}

function mergeImmutableSchemaData(schema, immutableSchemaData, mergedData) {
    const schemaType = getSchemaType(schema);
    if (schemaType !== SchemaTypes.TYPE_OBJECT && schemaType !== SchemaTypes._TYPE_ANYOF) {
        throw new Error(`mergeImmutableSchemaData: Only support "object" or "anyOf" schema, actual type: ${schemaType}`);
    }
    return createImmutableSchemaData(schema, assign(
        immutableSchemaData.toJS(),
        mergedData
    ));
}

export {
    createImmutableSchemaData,
    mergeImmutableSchemaData
}

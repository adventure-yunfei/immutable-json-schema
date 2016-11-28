const SchemaTypes = {
    TYPE_NUMBER: 'number',
    TYPE_STRING: 'string',
    TYPE_BOOLEAN: 'boolean',
    TYPE_OBJECT: 'object',
    TYPE_ARRAY: 'array',

    // 内部复合类型
    _TYPE_ENUM: '_enum',
    _TYPE_ANYOF: '_anyOf',
    _TYPE_REF: '_$ref'
};

function getSchemaType(schema) {
    if (schema.type) {
        return schema.type;
    } else if (schema.enum) {
        return SchemaTypes._TYPE_ENUM;
    } else if (schema.anyOf) {
        return SchemaTypes._TYPE_ANYOF;
    } else if (schema.$ref) {
        return SchemaTypes._TYPE_REF;
    }
}

export {
    SchemaTypes,
    getSchemaType
}

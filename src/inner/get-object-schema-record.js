import immutable from 'immutable';
import mapValues from 'lodash/mapValues';

function getObjectSchemaRecord(schema) {
    if (!schema.__record) {
        const recordOptions = mapValues(schema.properties, () => null);
        schema.__record = new immutable.Record(recordOptions, `SchemaRecord[${schema.title || ''}]`);
    }
    return schema.__record;
}

export {
    getObjectSchemaRecord
}

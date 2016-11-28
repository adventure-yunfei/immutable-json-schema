import {compile, compileEnum, compileAnyOf} from './compile';
import {createImmutableSchemaData, mergeImmutableSchemaData} from './create-immutable-schema-data';
import {validate} from './validate';
import {ofSchema} from './react-prop-types';
import {setupConfig} from './config';

const ReactPropTypes = {
    ofSchema
}

export {
    // Create schema
    compile,
    compileEnum,
    compileAnyOf,

    // Validate data with schema
    validate,

    // Transform data to immutable by schema
    createImmutableSchemaData,
    mergeImmutableSchemaData,

    // React PropTypes validator
    ReactPropTypes,

    // Configure immutable-json-schema behavior
    setupConfig
}

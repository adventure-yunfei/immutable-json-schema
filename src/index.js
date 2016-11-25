import {compile, compileEnum, compileAnyOf} from './compile';
import {createImmutableSchemaData, mergeImmutableSchemaData} from './immutable-schema-bindings';

export {
    // Create schema
    compile,
    compileEnum,
    compileAnyOf,

    // Transform data to immutable by schema
    createImmutableSchemaData,
    mergeImmutableSchemaData
}

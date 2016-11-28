var _ = require('lodash'),
    assert = require('chai').assert,
    validate = require('../lib/validate'),
    immutableSchema = require('../lib/index');

describe('Example Test', function () {
    it('Random Test', function () {
        var schema = immutableSchema.compile({
            a_obj: {
                str_in_a_obj: 'string'
            },
            b_arr: ['number'],
            c_num: 'number',
            d_str: 'string',
            e_bool: 'boolean',
            f_enum: immutableSchema.compileEnum(['a', 2, false]),
            d_anyof: immutableSchema.compileAnyOf([
                'string',
                'boolean'
            ])
        });
        function ensureNotSchema(schema, data) {
            try {
                validate.ensureSchema(schema, data);
            } catch (e) {
                return;
            }
            throw new Error('Invalid data passed Schema test: ' + JSON.stringify(data));
        }

        var data = {
            a_obj: {
                str_in_a_obj: 'a string'
            },
            b_arr: [23, 22],
            c_num: 4,
            d_str: 'str two',
            e_bool: true,
            f_enum: false,
            d_anyof: true
        };
        function copyData(props) {
            return Object.assign({}, data, props);
        }
        validate.ensureSchema(schema, data);

        validate.ensureSchema(schema, copyData({
            d_anyof: '32'
        }));

        validate.ensureSchema(schema, copyData({
            b_arr: []
        }));

        ensureNotSchema(copyData({
            c_num: true
        }));

        ensureNotSchema(copyData({
            a_obj: {
                str_in_a_obj: 22
            }
        }));

        ensureNotSchema(copyData({
            f_enum: true
        }));


        // Test immutable creation
        const schemaData = immutableSchema.createImmutableSchemaData(schema, data);
        assert.deepEqual(schemaData.toJS(), data);

        assert.deepEqual(immutableSchema.createImmutableSchemaData(schema, copyData({
            extra_prop: 231
        })).toJS(), data);

        assert.deepEqual(immutableSchema.createImmutableSchemaData(schema, copyData({
            a_obj: {
                str_in_a_obj: 'a string',
                extra_prop: 'aaa'
            },
        })).toJS(), data);

        function checkMergeSchemaData(mergedData) {
            assert.deepEqual(immutableSchema.mergeImmutableSchemaData(schema, schemaData, mergedData).toJS(), copyData(data));
        }
        checkMergeSchemaData({
            a_obj: {
                str_in_a_obj: 'xxx'
            }
        });

        checkMergeSchemaData({e_bool: false, d_str: '22'});
    });
});

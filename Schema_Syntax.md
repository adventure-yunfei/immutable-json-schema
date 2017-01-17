# Schema 语法详解

### 支持的类型:

- `"string"`  验证字符串类型
- `"boolean"`  验证布尔值类型
- `"number"`  验证数字类型
- `"object"`  验证对象类型
- `"array"`  验证数组类型
- 复合类型:
    - `anyOf`  任一Schema通过验证，则其通过验证
    - `enum`  验证枚举值

### 语法关键字

- `__raw`: 为`true`时标记语法为JSON-Schema标准语法
- `__options`: 用于配置Object类型的参数，可用的可选项为:
    - `default` 定义默认值 (传入数据值为`undefined`时应用的默认值，为`null`时**不应用**默认值)
    - `required` (对"object"类型) 定义Object类型的必填项
    - `notRequired` (对"object"类型) 类似"required"关键字，定义Object类型的可选项 (其余项必填)，优先级低于"required"

### 字符串格式语法:

```javascript
// 语法
"<type> ( | <option_key> : <option_json_value> )*"
// <option_json_value> 为 <option_value> JSON字符串化后的对应值
// <type> 可用值参考上面所述"支持的类型"(除复合类型外)

// 示例
compile('number');
compile('boolean');
compile('string | default: "abc"'); // 定义数字类型，以及默认值: "abc"
```

### 定义对象(Object):

```javascript
// 语法
{
    prop_key_1: prop_schema_1,
    prop_key_2: prop_schema_2,
    ...,

    // __options 可不填
    __options: {
        option_key_1: option_value_1,
        ...
    }
}

// 示例
compile({
    a_num: 'number',
    b_bool: 'boolean | default: true',
    c_str: 'string',
    // 对象嵌套定义
    d_inner_obj: {
        foo: 'string',
        bar: 'string',
        __options: { required: ['foo'] } // 定义对象属性 "foo" 必填, "bar" 可选
    }
    __options: {
        notRequired: ['c_str', 'd_inner_obj'], // 定义对象属性 "a_num", "b_bool" 必填
        default: {a_num: 12, b_str: 'xxx'} // 定义对象默认值
    }
});
```

### 定义数组:

```javascript
// 语法
[item_schema]
// 或
[item_schema, {__options: {option_key_1: option_value_1}}]

// 示例
compile(['number'])  // 合法数据: [1, 2, 3]
compile(['string', {__options: {default: ['foo', 'bar']}}])
compile([{
    foo: 'string',
    bar: 'number',
    inner_arr: ['boolean', {__options: {default: [false, true]}}],
    another_inner_obj: {
        foobar: 'string'
    }
}])
```

### `anyOf` 语法: 任意子schema通过验证则合法

```javascript
// 示例
compileAnyOf([
  compile({a_num: 'number'}),
  compile({b_str: 'string'})
]);

// 以下数据均合法:
{
  a_num: 123
}

{
  b_str: 'some string'
}
```

### `enum` 语法: 仅允许值为指定的可选值范围内

```javascript
// 示例
compileEnum([1, 2, 'abc']); // 仅有数据 1, 2, 'abc' 合法


//也可传入Object类型:
const EnumFileType = {
    Image: 1,
    Music: 2,
    Video: 3
};

compileEnum(EnumFileType); // 等同于: compileEnum([1, 2, 3]);
```

### `enum` 和 `anyOf` 结合使用示例

通常情况，出现 `anyOf` 关键字时也会出现 `enum` 关键字，代表在某个字段的某个值域内时，整体具有某些特殊的额外字段。
比如，定义电脑资源数据格式，包含文件和文件夹两种类型，且不同类型有不同的额外字段：

```javascript
const commonResourceSrc = {
        // type: 'string',
        name: 'string',
        modifyDate: 'number'
    },
    
    FileSchema = compile({
        ...commonResourceSrc,
        type: compileEnum(['file']),
        fileSize: 'number'
    }),
    
    FolderSchema = compile({
        ...commonResourceSrc,
        type: compileEnum(['folder']),
        folderFileCount: 'number'
    });

// 实际导出的 Schema 
export const ResourceSchema = compileAnyOf([
    FileSchema,
    FolderSchema
]);
```

### 兼容 JSON Schema 标准语法

已实现的兼容 JSON-Schema 标准语法的关键字:

- `type`
- `items`
- `properties`
- `required`
- `default`
- `anyOf` (仅对"object"类型)
- `enum`
- 额外关键字:
    - `notRequired`

```javascript
// 示例
compile({
    __raw: true, // 非简写语法标记
    type: 'object',
    properties: {
        a_num: {
            type: 'number'
        },
        b_str: {
            type: 'string'
        },
        c_bool: {
            type: 'boolean',
            default: true
        },
        d_array: {
            type: 'array',
            items: {
                type: 'number'
            }
        },
        f_complex_array: {
            type: 'array',
            items: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        foo: 'string'
                    }
                }
            },
            default: []
        }
    },
    required: ['c_bool]
});

// 等同的schema简写语法:
compile({
  a_num: 'number',
  b_str: 'string',
  c_bool: 'boolean',
  d_array: ['number'],
  f_complex_array: [[{foo: 'string'}], {__options: {default: []}}],
  __options: {
    required: ['c_boolean']
  }
});
```

# 参考

- [JSON-Schema](json-schema.org) 第4版

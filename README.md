# Immutable JSON Schema

契合 React 与 Immutable 的 JSON Schema。

- JSON数据校验，保证应用正常运行
- 作为数据文档，方便协同合作
- 语法简单
- 与 Immutable 结合，自动转换 Record
- 与 React PropTypes 结合，校验组件数据
- 兼容 JSON-Schema 语法 (已实现部分)

# Schema 使用示例

具体语法参考文档 [Schema 语法]()。

```javascript
compile({
  a_str: 'string',
  b_bool: 'boolean',
  c_num: 'number | default: 123', // 定义数字类型，以及默认值: 123

  // 定义一个对象
  d_obj: {
    inner_num: 'number',
    inner_str: 'string',
    // 嵌套定义
    inner_obj: {
        some_str: 'string',
        __options: { required: ['some_str'] }
    },
    __options: { notRequired: ['inner_str'] }, // 'inner_str' 可选，其余必填
  },

  e_arr: [ {e0: 'boolean'} ], // 定义对象数组
  f_arr_number: ['number'], // 定义数字数组

  // 定义"anyOf": 任意子schema通过验证则合法
  g_any: compileAnyOf([
    compile({a_num: 'number'}),
    compile({b_str: 'string'})
  ]),

  // 定义"enum": 仅指定的原始值可通过验证
  h_enum: compileEnum([1, 2, 'abc'])
});
```

### 兼容 JSON Schema 标准语法

```javascript
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
    c_boolean: {
      type: 'boolean'
    },
    d_array: {
      type: 'array',
      items: {
        type: 'number'
      }
    }
  },
  notRequired: ['c_boolean']
});

// 等效的schema简写语法:
compile({
  a_num: 'number',
  b_str: 'string',
  c_boolean: 'boolean',
  d_array: ['number']
  __options: {
    notRequired: ['c_boolean']
  }
});
```

# Schema 与 Immutable 结合

为了配合 React PureRender，必须采用 Immutable JSON 数据。而直接转换得到的普通的 Immutable.Map 数据只能通过 `.get('XXX')` 访问，使用不方便，且不利于组内推广。

通过 Schema 预定义的格式，将 Map 转换成 Record，以方便读取，同时可以非常高效的用于React PropTypes的组件数据格式校验。

### Schema 到 Immutable 的对应类型

Schema 定义的类型与转换后的 Immutable 类型对应：

- Array -> Immutable.List
- Object -> Immutable.Record
- string/boolean/number -> 保持不变

### Schema 转换数据为 Immutable 格式

- `createImmutableSchema(schema, data)` 将json数据完整的转换为schema & immutable数据
- `mergeImmutableSchema(schema, oldSchemaImmutableData, newChangesData)` 将部分json数据合并到已有的schema & immutable数据上

注：转换成immutable之后，对"object"类型会过滤未定义的属性

### Schema 与 React PropTypes 结合: `ofSchema`

假设定义了Schema: `MemberListSchema`。
当某个组件接受这个Schema格式的数据时，可以定义如下`propTypes`校验数据:

```javascript
    static propTypes = {
        members: ReactPropTypes.ofSchema(MemberListSchema).isRequired
    }
```

# Immutable JSON Schema

契合 React 与 Immutable 的 JSON Schema。

- JSON数据校验，保证应用正常运行
- 作为数据文档，方便协同合作
- 语法简单
- 与 Immutable 结合，自动转换 Record
- 与 React PropTypes 结合，校验组件数据
- 兼容 JSON-Schema 语法 (已实现部分)

# Schema 使用示例
```javascript
import {compile, compileEnum, validate, createImmutableSchemaData, mergeImmutableSchemaData, ReactPropTypes} from 'immutable-json-schema';

// 创建 Schema
const UserSchema = compile({
    name: 'string',
    age: 'number',
    married: 'boolean'
    gender: compileEnum(['male', 'female']),
    childrenNames: ['string']
});

// 数据源
const userJSONData = {
    name: 'Jack',
    age: 26,
    married: false,
    gender: 'male',
    childrenNames: ['Tom', 'Jerry'],
    foo: 'bar'
};

// 可校验数据
validate(UserSchema, userJSONData) === '';

// 验证数据, 转换为immutable (Object => immutable.Record)
const immutableUserData = createImmutableSchemaData(UserSchema, userJSONData);
// 现在数据一定符合 UserSchema 定义的数据格式，并且多余的属性也会被移除(这里的 {foo: 'bar'})

// 校验方法同样适用于转换后的immutable数据
validate(UserSchema, immutableUserData) === '';

// 用 UserSchema 校验 React 组件数据
class UserDetailPage extends React.Component {
    static propTypes = {
        userData: ReactPropTypes.ofSchema(UserSchema).isRequired
    }
    // ...
}

// 修改immutable数据，同时保证依然符合UserSchema格式
const newImmutableUserData = mergeImmutableSchemaData(UserSchema, immutableUserData, {
    married: true
});

```

# Schema 语法示例

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

通过 Schema 预定义的格式，将 Map 转换成 Record，以方便读取，也可以非常高效的用于React PropTypes的组件数据格式校验。

同时，数据的修改也会依然保持Schema定义的数据格式。

### Schema 到 Immutable 的对应类型

Schema 定义的类型与转换后的 Immutable 类型对应：

- array -> Immutable.List
- object -> Immutable.Record (注：转换成immutable之后，对"object"类型会过滤未定义的属性)
- string/boolean/number -> 保持不变

# API

### 编译 Schema

- `compile(schemaDefinition): schema` 编译Schema
- `compileEnum(<Array|Object>): schema` 编译"enum"类型Schema
- `compileAnyOf(<Array.<schemaDefinition>>): schema` 编译"anyOf"类型Schema

### 验证数据

- `validate(schema, data): error_string` 验证数据，并返回错误原因的字符串，(验证正确则返回空字符串)

### 转换为 Immutable

- `createImmutableSchemaData(schema, data): immutableData` 将json数据完整的转换为schema & immutable数据
- `mergeImmutableSchemaData(schema, oldSchemaImmutableData, newChangesData): immutableData` 修改数据，将部分json数据合并到已有的schema & immutable数据上

### React PropTypes 组件数据校验

- `ReactPropTypes.ofSchema(schema): react_prop_validator` 验证组件值符合Schema格式

### 自定义配置

- `setupConfig({...})`。可用的配置项为:
  - `defaultRequired` 对"object"类型，如果没有指明"required"或"notRequired"选项，是否默认全部属性为必填 (默认为 true)
  - `shallowValidateImmutableRecord` 执行验证时，是否对immutable Record不作深层比对 (默认为 true, 性能更好，在**仅通过** mergeImmutableSchemaData 修改数据时可保证正确性)

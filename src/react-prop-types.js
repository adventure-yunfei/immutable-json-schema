import {validate} from './validate';

function createReactChainableTypeChecker(validate) {
    function checkType(isRequired, props, propName, componentName, location, propFullName) {
        componentName = componentName || '<<anonymous>>';
        propFullName = propFullName || propName;
        if (props[propName] == null) {
            if (isRequired) {
                return new Error('Required ' + location + ' `' + propFullName + '` was not specified in ' + ('`' + componentName + '`.'));
            }
            return null;
        } else {
            return validate(props, propName, componentName, location, propFullName);
        }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
}

function ofSchema(schema) {
    return createReactChainableTypeChecker((props, propName, componentName, location, propFullName) => {
        const propValue = props[propName],
            errMsg = validate(schema, propValue);
        if (errMsg !== '') {
            return new Error(`In "${componentName}", ${location} "${propFullName}" invalid. Expect schema data. Error is:\n${errMsg}`);
        } else {
            return null;
        }
    });
}

export {
    ofSchema
}

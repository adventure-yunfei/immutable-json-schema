import assign from 'lodash/assign';

const config = {
    /**@type boolean
     * Whether to make all properties of object default as required */
    defaultRequired: true,

    /**@type boolean
     * Whether to only test immutable Record by "instanceof" when validating Record instance. (If false, test all schema properties) */
    shallowValidateImmutableRecord: true
};

function getConfig() {
    return config;
}

function setupConfig(extraConfig) {
    assign(config, extraConfig);
}

export {
    getConfig,
    setupConfig
}

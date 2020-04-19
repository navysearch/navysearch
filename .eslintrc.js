module.exports = {
    env: {
        es6: true,
        jest: true,
        node: true
    },
    extends: [
        'omaha-prime-grade'
    ],
    parser: 'babel-eslint',
    rules: {
        'compat/compat': 'off'
    }
};
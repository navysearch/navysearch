module.exports = {
    presets: [
        '@babel/preset-env',
        ['minify', {mangle: false}]
    ],
    plugins: [
        '@babel/transform-runtime',
        '@babel/proposal-class-properties',
        '@babel/proposal-optional-chaining',
        '@babel/proposal-export-default-from'
    ]
};
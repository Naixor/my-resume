System.config({
    baseUrl: './',
    transpiler: 'typescript',
    typescriptOptions: {
        module: 'system',
        resolveTypings: true,
        emitDecoratorMetadata: true,
        sourceMap: true,
        inlineSourceMap: false  
    },
    packages: {        
        'src': {
            main: 'main.ts',
            format: 'esm',
            defaultExtension: 'ts'
        },
        'ng2-material': {
            defaultExtension: 'js'
        }
    },
    map: {
        'typescript': './node_modules/typescript/lib/typescript.js',
        'ng2-material': './node_modules/ng2-material'
    }
});
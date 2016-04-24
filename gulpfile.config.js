var config = function () {
    this.src = './src/';
    this.mainPage = this.src + 'index.html';
    this.dist = './dist/';
    this.mainFileName = 'main';
    this.outputPath = this.dist + 'app/';
    this.tsFiles = [this.src + '**/**/*.ts', this.src + '*.ts'];
    this.dtsFiles = './typings/**/*.d.ts';
    
    this.systemJs = {
        configFile: {
            dev: './config.dev.js',
            public: './config.js'
        }
    };
    this.ag2 = {
        initialFiles: [
            "node_modules/es6-shim/es6-shim.min.js",
            "node_modules/systemjs/dist/system-polyfills.js",
            "node_modules/angular2/es6/dev/src/testing/shims_for_IE.js",
            "node_modules/angular2/bundles/angular2-polyfills.js",
            "node_modules/systemjs/dist/system.src.js",
            "node_modules/rxjs/bundles/Rx.js",
            "node_modules/angular2/bundles/angular2.dev.js",
            "node_modules/angular2/bundles/http.dev.js",
            "node_modules/angular2/bundles/router.dev.js"
        ]
    };
    this.libs = [
        "src/libs/cv.min.js"
    ];
    this.stylesheets = [
        "node_modules/ng2-material/dist/ng2-material.css",
        "node_modules/ng2-material/dist/font.css"
    ];
};

module.exports = config;
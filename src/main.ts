import {bootstrap} from 'angular2/platform/browser';
import {provide, 
        PACKAGE_ROOT_URL} from 'angular2/core';
import {App} from './components/app/app';


bootstrap(App, [provide(PACKAGE_ROOT_URL , {
    useValue: 'src/components'
})]);
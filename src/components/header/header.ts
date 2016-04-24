import {Component} from 'angular2/core';

@Component({
    selector: 'header-view',
    templateUrl : 'package:header/header.html',
    styleUrls: ['package:header/header.css'],
    inputs: ['title', 'items']
})

export class Header {
    title: string;
    navItems: string[];
    constructor() {
    }
    ngOnInit() {
    }
    getLink(str: string): string {
        return str.toLowerCase().replace(/\s/g, '-');
    }
}
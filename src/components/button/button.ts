import {Component ,
        Attribute ,
        ElementRef ,
        ViewChild } from 'angular2/core';

// let style = require('button.css');

@Component({
   selector: 'md-button',
   templateUrl: 'package:/button/button.html',
   styleUrls: ['package:/button/button.css']
})

export class MdButton {
    @ViewChild ('title') title: ElementRef; 
    text: string;
    constructor(@Attribute('text') text: string) {
        this.text = text;
    }
    ngAfterViewInit(){
        console.log(this.title);
    }
}
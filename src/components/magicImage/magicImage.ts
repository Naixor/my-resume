import {Component ,ElementRef, Attribute, Injectable, provide, Inject, ViewChild, ChangeDetectorRef } from 'angular2/core';
import {HTTP_PROVIDERS, Http, Headers, XHRConnection, BaseRequestOptions, XHRBackend } from 'angular2/http';
import {Base64} from '../../libs/base64';
import {MiXHRBackend} from '../../libs/MiXHRConnection';

@Injectable()
class Base64Coder extends Base64 {
    constructor() {
        super();
    }
}

@Component({
    selector: 'magic-image',
    templateUrl : 'package:/magicImage/magicImage.html', 
    providers: [
        HTTP_PROVIDERS,
        provide(XHRBackend , {
            useClass: MiXHRBackend
        }),
        Base64Coder
    ],
    styles : [`
        .mimg-circle {
            overflow: hidden;
            border-radius: 50% 50%;
            position: relative;
        }
        .mimg-default {
            overflow: hidden;
            position: relative;            
        }
    `],
    inputs: ['src', 'width', 'height', 'lockRatio', 'type']
})

export class MagicImage {
    private httpObservable: any = null;
    src: string;
    width: number;
    height: number;
    radio: number;
    lockRatio: string = 'min';
    className: string;
    context: CanvasRenderingContext2D = null;
    image: HTMLImageElement = null;
    imageData: ImageData = null;
    worker: Worker;
    @ViewChild('canvas') canvas: ElementRef;
    constructor(
        @Inject(Http) http,
        @Inject(Base64Coder) base64,
        @Attribute('src') src: string,
        @Attribute('width') width: number,
        @Attribute('height') height: number,
        @Attribute('lockRatio') lockRatio: string,
        @Attribute('type') type: string,
        public applyChanges: ChangeDetectorRef
    ) {
        this.src = src;
        this.width = width || 0;
        this.height = height || 0;
        this.className = `mimg-${type || 'default'}`;
        this.worker = new Worker('src/components/magicImage/imageFilterWorker.js');

        let headers = new Headers();
        headers.append('Accept', 'image/webp,image/*,*/*;q=0.8');
        headers.append('responseType', 'arraybuffer');
        this.httpObservable = http.get(this.src, {
            headers
        });
    }
    ngAfterViewInit() {
        this.context = this.canvas.nativeElement.getContext('2d');

        this.httpObservable.subscribe((data: any) => {
            switch (data.state) {
                case 'progress':
                    this.context.font = "16px Verdana";
                    this.context.fillStyle = "#FFF";
                    this.context.textAlign = "center";
                    this.context.fillText(data.response * 100 + '%', this.width/2, this.height/2);
                    break;
                case 'loaded':
                    let blob = new Blob([data.response.blob()], {type: data.response.headers.get('Content-Type')});
                    let domURL = window.URL,
                        url = domURL.createObjectURL(blob),
                        img = new Image;
                    img.onload = () => {
                        domURL.revokeObjectURL(url);  // clean up
                        this.radio = img.width / img.height;
                        this.applyRadio();
                        this.applyChanges.detectChanges();
                        this.image = img;
                        this.getImageData();
                        // CV.filter.Canny.process(this.imageData.data, this.imageData.width, this.imageData.height, 40, 20);
                        // CV.filter.DoG.process(this.imageData.data, this.imageData.width, this.imageData.height, 3, 3, 1, 0.6);
                        // CV.filter.Cartoon.process(this.imageData.data, this.imageData.width, this.imageData.height, 10, 15);
                        // this.drawImage(this.image);
                        this.worker.postMessage(this.imageData);
                        this.worker.onmessage = (event) => {
                            console.log(1);
                            this.imageData = event.data;
                            this.putImageData();
                        }
                        this.putImageData();                        
                    };
                    img.src = url;
                    break;
            }
        });
    }
    getImageData(): ImageData {
        if (!this.image) {
            return null;
        }
        let canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(this.image, 0, 0, this.width, this.height);
        this.imageData = ctx.getImageData(0, 0, this.width, this.height);
    }
    putImageData(): void {
        if (!this.imageData) {
            return;
        }
        this.context.putImageData(this.imageData, 0, 0);
    }
    nextTrick() {

    }
    applyRadio() {
        if (this.width && this.height) {
            switch (this.lockRatio) {
                case 'min': {
                    if (this.width / this.height > this.radio) {
                        this.width = this.radio * this.height;
                    } else {
                        this.height = this.width / this.radio;
                    }
                }
                case 'max': {
                    if (this.width / this.height > this.radio) {
                        this.height = this.width / this.radio;
                    } else {
                        this.width = this.radio * this.height;
                    }
                }
            }
        } else {
            this.width && (this.height = this.width / this.radio);
            this.height && (this.width = this.radio * this.height);
        }
    }
    drawImage(image) {
        if (!this.context) {
            this.context = this.canvas.nativeElement.getContext('2d');
        }
        this.context.drawImage(image, 0, 0, this.width, this.height);
    }
}

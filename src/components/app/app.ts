import {provide, 
        PACKAGE_ROOT_URL,
        Component,
        ElementRef,
        ViewChild,
        ChangeDetectorRef} from 'angular2/core';
import {MATERIAL_DIRECTIVES, MATERIAL_PROVIDERS} from "ng2-material/all";
import {MdButton} from '../button/button';
import {Header} from '../header/header';
import {MagicImage} from '../magicImage/magicImage';

@Component({
    selector: 'app',
    templateUrl : 'package:app/app.html',
    styleUrls: ['package:app/app.css'],
    directives: [Header, MagicImage, MATERIAL_DIRECTIVES],
})

export class App {
    pageData: any;
    experienceList: Array<Array<any>>;
    parttimeList: Array<Array<any>>;
    @ViewChild('waterFlow') waterFlow: ElementRef;
    constructor(
        public applyChanges: ChangeDetectorRef
    ) {
        this.pageData = {
            header: {
                title: 'Naixor',
                navItems: ['ABOUT ME', 'EDUCATION', 'WORK EXPERIENCE', 'PART TIME']
            },
            info: {
                baseInfoLists: [
                    {
                        label: 'NAME',
                        value: '齐鸿烨'
                    },
                    {
                        label: 'BORN',
                        value: '06, 11, 1992'
                    },
                    {
                        label: 'NOW',
                        value: 'Baidu'
                    },
                    {
                        label: 'LEVEL',
                        value: 'T5'
                    },
                    {
                        label: 'POSITION',
                        value: '前端开发&测试'
                    },
                    {
                        label: 'SKILLS',
                        value: 'React,Angular1&2,SVG,Canvas,Nodejs,Mysql'
                    },
                    {
                        label: 'EMAIL',
                        value: 'hongyesoftware@gmail.com'
                    },
                    {
                        label: 'GITHUB',
                        value: 'https://github.com/Naixor'
                    }
                ],
                experiences: [
                    {
                        title: '移动端H5开发&内部平台前端开发',
                        img: `data:img/jpg;base64,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
fhECYwsI4VEAAAAASUVORK5CYII=`,
                        content: '从事部门和公司的移动端H5开发，由于嫌弃学习zepto太麻烦，自己开发了个屏幕切换、手势事件、加载判定和style操作等基础事件库。',
                        time: '2014.6 - 2015.1',
                        tags: ['css', 'js', 'cocos2d', 'echart']
                    },
                    {
                        title: '负责FEX项目的自动化测试',
                        content: 'fis core自动化case编写及CodeReview，百度脑图前后端测试，百度H5自动化测试',
                        time: '2015.1 - 2015.12',
                        tags: ['grunt', 'gulp', 'mocha', 'selenium', 'webdriver']
                    },
                    {
                        title: 'PageDiff项目负责人',
                        content: '主要通过DOM对比和浏览器截图两种方式来对前段项目进行自动化回归测试和兼容性测试以及广告监控等。',
                        time: '2015.4 - 今',
                        tags: ['css', 'jade', 'angular1', 'express', 'mysql']
                    },
                    {
                        title: '百度脑图前端开发&维护',
                        content: '根据用户的需求开发脑图新功能。处理脑图前端BUG和不良用户体验，优化处理速度',
                        time: '2015.9 - 今',
                        tags: ['grunt', 'js', 'kity', 'kityminder']
                    },
                    {
                        title: 'WebDriver Recorder开发',
                        content: '将用户在浏览器上的操作转换成前端e2e自动化case的工具',
                        time: '2016.3 - 今',
                        tags: ['electron', 'chrome extension', 'js']
                    }
                ],
                parttime: [
                    {
                        title: 'hyswipe - H5场景切换库',
                        content: '包含四种切换方式，内置了一个自己实现的满足此库使用的jQuery',
                        github: 'https://github.com/Naixor/hyswipe',
                        link: 'https://github.com/Naixor/hyswipe'
                    },
                    {
                        title: '音频绘制',
                        content: '看到百度手机音乐上的音频绘制挺有意思的，于是自己写了个canvas版本，最开始以为是sin波的，后来意识到是贝塞尔曲线',
                        github: 'http://naixor.github.io/canvas/AudioMedia/',
                        link: 'https://github.com/Naixor/AudioMedia'
                    },
                    {
                        title: 'cv.js',
                        content: '编写PageDiff时需要用到图片对比算法，加上本身对此很感兴趣，于是将自己的学习过程整理成此库。',
                        github: 'https://github.com/Naixor/cv',
                        link: 'http://naixor.github.io/cv/example.html'
                    },
                    {
                        title: 'vscode插件html2jsx',
                        content: '由于后续使用vscode作为编辑器，然后使用时发现有些我常用的sublime和atom插件vsc并没有，于是乎写了一个',
                        github: 'https://github.com/Naixor/html2jsx-vscode-extension',
                        link: 'https://marketplace.visualstudio.com/items?itemName=Stormspirit.html2jsx-vscode-extension'
                    },
                    {
                        title: 'vscode插件eval',
                        content: '由于后续使用vscode作为编辑器，然后使用时发现有些我常用的sublime和atom插件vsc并没有，于是乎写了一个',
                        github: 'https://github.com/Naixor/eval-vscode-extension',
                        link: 'https://marketplace.visualstudio.com/items?itemName=Stormspirit.eval'
                    }
                ]
            }
        };
        this.experienceList = [[], [], []];
        this.parttimeList = [[], [], []];
        this.pageData.info.parttime.forEach((exp, i) => {
            this.parttimeList[i%3].push(exp);
        });
    }
    ngAfterViewInit() {
        let children = [].slice.call(this.waterFlow.nativeElement.children);
        this.pageData.info.experiences.forEach(exp => {
            let h = Number.MAX_VALUE;
            let idx = 0;
            children.forEach((child, i) => {
                let height = parseInt(getComputedStyle(child).height);
                if (h > height) {
                    h = height;
                    idx = i;
                }
            });
            this.experienceList[idx].push(exp);
            this.applyChanges.detectChanges();
        });
    }
}
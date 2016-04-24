import {provide, 
        PACKAGE_ROOT_URL,
        Component} from 'angular2/core';
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
    constructor() {
        this.pageData = {
            header: {
                title: 'Naixor',
                navItems: ['ABOUT ME', 'EDUCATION', 'WORK EXPERIENCE', 'PART TIME']
            },
            info: {
                baseInfoLists: [
                    {
                        label: 'NAME',
                        value: 'Hongye Qi'
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
                        content: '从事部门和公司的移动端H5开发，由于嫌弃学习zepto太麻烦，自己开发了个屏幕切换、手势事件、加载判定和style操作等基础事件库。',
                        time: '2014.6 - 2015.1'
                    },
                    {
                        title: '负责FEX项目的自动化测试',
                        content: 'fis core自动化case编写及CodeReview，百度脑图前后端测试，百度H5自动化测试',
                        time: '2015.1 - 2015.12'
                    },
                    {
                        title: 'PageDiff项目负责人',
                        content: '主要通过DOM对比和浏览器截图两种方式来对前段项目进行自动化回归测试和兼容性测试以及广告监控等。',
                        time: '2015.4 - 今'
                    },
                    {
                        title: '百度脑图前端开发&维护',
                        content: '根据用户的需求开发脑图新功能。处理脑图前端BUG和不良用户体验，优化处理速度',
                        time: '2015.9 - 今'
                    },
                    {
                        title: 'WebDriver Recorder开发',
                        content: '将用户在浏览器上的操作转换成前端e2e自动化case的工具',
                        time: '2016.3 - 今'
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
        this.pageData.info.experiences.forEach((exp, i) => {
            this.experienceList[i%3].push(exp);
        });
        this.parttimeList = [[], [], []];
        this.pageData.info.parttime.forEach((exp, i) => {
            this.parttimeList[i%3].push(exp);
        });
    }
}
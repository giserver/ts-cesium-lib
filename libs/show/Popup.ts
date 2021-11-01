import { Cartesian2, Cartesian3, SceneTransforms, Viewer } from "cesium";
import { FeatureBase } from "..";

const div_base = "self-define-popup";
const div_close = "self-define-popup-close-button";
const div_content = "self-define-popup-content";

export default class Popup extends FeatureBase {

    private readonly define_html = `
    <div>
        <style>
            .${div_base} {
                position: absolute;
                display: none;
                left: 400px;
                top: 600px;
                background-color: #fff;
                box-shadow: 0 0 5px 0 rgba(0, 0, 0, .3);
                z-index: 100;
            }
    
            .${div_base}:after {
                display: inline-block;
                position: absolute;
                bottom: -13px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border: 5px solid transparent;
                border-top: 8px solid #fff;
                content: "";
            }
    
            .${div_close} {
                font-size: 24px;
                position: absolute;
                background: #fff;
                padding: 0 6px;
                box-sizing: border-box;
                cursor: pointer;
                z-index: 101;
                transition: color .3s;
                top: 0;
                right: 0;
                border-radius: 2px;
                width: 30px;
                height: 30px;
                color: #5d5d5d;
                background-color: transparent;
                border: 0;
            }
    
            .${div_close}:hover {
                color: #1890ff;
            }
    
            .${div_content} {
                width: 100%;
                height: 100%;
                padding: 25px 25px 10px 10px;
            }
        </style>
        <div class="${div_base}"> 
            <div class="${div_close}">×</div>
            <div class="${div_content}"></div>
        </div>
        </div>`;

    /**
     * 当前popup位置 地理坐标
     *
     * @private
     * @type {(Cartesian3 | undefined)}
     * @memberof Popup
     */
    private position: Cartesian3 | undefined;

    /**
     * 是否使用模板
     *
     * @private
     * @type {boolean}
     * @memberof Popup
     */
    private useTemplate: boolean;


    /**
     * Creates an instance of Popup.
     * @param {Viewer} viewer
     * @param {boolean} [useTemplate=false] 是否使用模板 默认true
     * @memberof Popup
     */
    constructor(viewer: Viewer, useTemplate: boolean = true) {
        super(viewer);

        this.useTemplate = useTemplate;

        //初始化模板
        if (useTemplate) {
            this.addTemplateDom();
        }

        //添加scene重绘监听 实现popup跟随移动
        this.addMapListener();
    }

    /**
     * popup展示信息
     *
     * @param {Cartesian2} position 屏幕位置
     * @param {HTMLElement} htmlElement popup渲染的html元素 如果 {@link useTemplate} 设置为true则html作为content渲染，如果为false则直接渲染
     * @memberof Popup
     */
    show(position: Cartesian2, htmlElement: HTMLElement) {
        if (this.useTemplate) {
            const element = this.tryGetElementByClass(div_content);
            if (element) {
                for (let i = 0; i < element.childElementCount; i++) {
                    element.removeChild(element.childNodes[i]);
                }
                element.appendChild(htmlElement);
            } else {
                console.error(`popup need provider a div named ${div_base}`);
            }
        } else {
            const element = this.tryGetElementByClass(div_base);
            if (element) {
                element.innerHTML = htmlElement.innerHTML;
            } else {
                htmlElement.className = div_base;
                htmlElement.style.position = 'absolute';
                htmlElement.style.zIndex = '100';
                this.viewer.container.appendChild(htmlElement);
            }
        }

        //计算地理坐标
        const ray = this.viewer.camera.getPickRay(position);
        this.position = this.viewer.scene.globe.pick(ray, this.viewer.scene);

        //更新位置
        this.setPopupPosition(position);
    }

    /**
     * 关闭当前popup
     *
     * @memberof Popup
     */
    close(): void {
        const element = this.tryGetElementByClass(div_base);
        if (element) {
            element.style.display = "none";
            this.position = undefined;
        }
    }

    /**
     * 添加默认模板dom
     *
     * @private
     * @memberof Popup
     */
    private addTemplateDom() {
        //添加默认模板
        const container = this.viewer.container;
        const popupContainer = document.createElement("div");
        popupContainer.innerHTML = this.define_html;
        container.appendChild(popupContainer);

        //设置关闭监听
        const closeElement = this.tryGetElementByClass(div_close);
        if (closeElement) {
            closeElement.addEventListener('click', () => {
                this.close();
            })
        }
    }

    /**
     * 添加scene更新渲染事件 计算当前地理坐标下的屏幕坐标并更新popup位置
     *
     * @private
     * @memberof Popup
     */
    private addMapListener() {
        this.viewer.scene.postRender.addEventListener(() => {
            if (this.position) {
                const windowPosition = SceneTransforms
                    .wgs84ToWindowCoordinates(this.viewer.scene, this.position);
                this.setPopupPosition(windowPosition);
            }
        });
    }

    /**
     * 更新popup位置
     *
     * @private
     * @param {Cartesian2} position
     * @memberof Popup
     */
    private setPopupPosition(position: Cartesian2) {
        const element = this.tryGetElementByClass(div_base);

        //当cesium container的起始屏幕坐标不在0，0位置时需要手动偏移
        const startX = this.viewer.container.getBoundingClientRect().x;
        if (element) {
            element.style.display = "block";
            element.style.left = `${Math.floor(position.x - element.clientWidth / 2 + startX)}px`;
            element.style.top = `${Math.floor(position.y - element.clientHeight)}px`;
        }
    }

    /**
     * 通过类名获取html第一个元素
     *
     * @private
     * @param {string} className 类名
     * @return {*} 
     * @memberof Popup
     */
    private tryGetElementByClass(className: string): HTMLElement | undefined {
        const elements = document.getElementsByClassName(className);
        return elements && elements[0] ? elements[0] as HTMLElement : undefined;
    }
}
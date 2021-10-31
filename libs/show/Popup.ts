import { Cartesian2, Cartesian3, SceneTransforms, Viewer } from "cesium";
import { FeatureBase } from "..";

export default class Popup extends FeatureBase {

    private readonly define_html = `
        <div class="self-define-popup"> 
            <div class="self-define-popup-close-button">×</div>
            <div class="self-define-popup-content"></div>
        </div>`;

    private readonly define_style = `
    .self-define-popup {
        position: absolute;
        display: none;
        left: 400px;
        top: 600px;
        background-color: #fff;
        box-shadow: 0 0 5px 0 rgba(0, 0, 0, .3);
        z-index: 100;
    }

    .self-define-popup:after {
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

    .self-define-popup-close-button {
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

    .self-define-popup-close-button:hover {
        color: #1890ff;
    }

    .self-define-popup-content {
        width: 100%;
        height: 100%;
        padding: 25px 25px 10px 10px;
    }`;

    private position: Cartesian3 | undefined;

    /**
     *
     */
    constructor(viewer: Viewer) {
        super(viewer);

        //初始化
        this.init();
    }

    show(position: Cartesian2, html: Element) {
        const ray = this.viewer.camera.getPickRay(position);
        this.position = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        this.setPopupPosition(position);

        const element = this.tryGetElementByClass<HTMLDivElement>("self-define-popup-content");
        if (element) {
            for (let i = 0; i < element.childElementCount; i++) {
                element.removeChild(element.childNodes[i]);
            }
            element.appendChild(html);
        }
    }

    clear(): void {
    }

    private init() {
        //添加自定义dom
        this.addDom();

        //添加关闭事件
        this.addCloseListener();

        //添加scene重绘监听 实现popup跟随移动
        this.addMapListener();
    }

    private addDom() {
        const container = this.viewer.container;
        const popupContainer = document.createElement("div");
        const popupStyle = document.createElement("style");

        popupContainer.innerHTML = this.define_html;
        popupStyle.innerHTML = this.define_style;
        popupContainer.appendChild(popupStyle);

        container.appendChild(popupContainer);
    }

    private addCloseListener() {
        const closeElement = this.tryGetElementByClass("self-define-popup-close-button");
        if (closeElement) {
            closeElement.addEventListener('click', () => {
                const element = this.tryGetElementByClass<HTMLDivElement>("self-define-popup");
                if (element) {
                    element.style.display = "none";
                    this.position = undefined;
                }
            })
        }
    }

    private addMapListener() {
        this.viewer.scene.postRender.addEventListener(() => {
            if (this.position) {
                const windowPosition = SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, this.position);
                this.setPopupPosition(windowPosition);
            }
        });
    }

    private setPopupPosition(position: Cartesian2) {
        const element = this.tryGetElementByClass<HTMLDivElement>("self-define-popup");
        const startX = this.viewer.container.getBoundingClientRect().x;
        if (element) {
            element.style.display = "block";
            element.style.left = `${position.x - element.clientWidth / 2 + startX}px`;
            element.style.top = `${position.y - element.clientHeight}px`;
        }
    }

    private tryGetElementByClass<T extends Element>(className: string) {
        const elements = document.getElementsByClassName(className);
        return elements && elements[0] ? elements[0] as T : undefined;
    }
}
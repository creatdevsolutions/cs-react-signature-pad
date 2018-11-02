import *  as React from "react";
import BezierCurve from "../util/BezierCurve";
import Point from "../util/Point";
import {RefObject} from "react";
import * as classnames from "classnames";
import styles from "./SignaturePad.css";

interface Props {
    velocityFilterWeight?: number;
    minStrokeWidth?: number;
    maxStrokeWidth?: number;
    dotSize?: number | Function;
    penColor?: string;
    backgroundColor?: string;
    onEnd?: Function;
    onBegin?: Function;

    height?: number;
    width?: number;

    showFullScreen?: boolean;
    fullScreenCloseAction?: React.ReactElement<any>

    ref: RefObject<SignaturePad>;
    className?: string;
    style?: object;
}

export default class SignaturePad extends React.Component<Props> {

    _velocityFilterWeight: number;
    _minStrokeWidth: number;
    _maxStrokeWidth: number;
    _dotSize: number | Function;
    _penColor: string;
    _backgroundColor: string;
    _onEnd: Function;
    _onBegin: Function;
    _canvas: HTMLCanvasElement;
    _canvasRef: RefObject<HTMLCanvasElement>;
    _ctx: CanvasRenderingContext2D;
    _isEmpty: boolean;
    _points: Point[];
    _lastVelocity: number;
    _lastWidth: number;
    _mouseButtonDown: boolean;

    constructor(props: Props) {
        super(props);

        this._velocityFilterWeight = this.props.velocityFilterWeight || 0.7;
        this._minStrokeWidth = this.props.minStrokeWidth || 0.5;
        this._maxStrokeWidth = this.props.maxStrokeWidth || 2.5;
        this._dotSize = this.props.dotSize || (() => (this._maxStrokeWidth + this._minStrokeWidth) / 2);
        this._penColor = this.props.penColor || "#000000";
        this._backgroundColor = this.props.backgroundColor || "rgba(0,0,0,0)";
        this._onEnd = this.props.onEnd;
        this._onBegin = this.props.onBegin;

        this._canvasRef = React.createRef<HTMLCanvasElement>();
    }

    componentDidMount() {
        this._canvas = this._canvasRef.current;
        this._ctx = this._canvas.getContext("2d");
        this.clear(null);

        this._handleMouseEvents();
        this._handleTouchEvents();
        this._resizeCanvas();
    }

    componentWillUnmount() {
        this.off();
    }

    clear(e?: any) {
        if (e) {
            e.preventDefault();
        }
        let ctx = this._ctx,
            canvas = this._canvas;

        ctx.fillStyle = this._backgroundColor;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        this._reset();
    }

    toDataURL(imageType: string, quality: number) {
        let canvas = this._canvas;
        return canvas.toDataURL.apply(canvas, arguments);
    }

    fromDataURL(dataUrl: string) {
        let self = this,
            image = new Image(),
            ratio = window.devicePixelRatio || 1,
            width = this._canvas.width / ratio,
            height = this._canvas.height / ratio;

        this._reset();
        image.src = dataUrl;
        image.onload = function () {
            self._ctx.drawImage(image, 0, 0, width, height);
        };
        this._isEmpty = false;
    }

    isEmpty() {
        return this._isEmpty;
    }

    componentDidUpdate() {
        this._resizeCanvas();
    }

    _resizeCanvas() {
        /*let ctx = this._ctx,
            canvas = this._canvas;
        // When zoomed out to less than 100%, for some very strange reason,
        // some browsers report devicePixelRatio as less than 1
        // and only part of the canvas is cleared then.
        /*let ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = //canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;*/

        if(this.props.showFullScreen) {
            this._canvas.width = window.innerWidth;
            this._canvas.height = window.innerHeight;
        }
        else {
            this._canvas.width = this.props.width;
            this._canvas.height = this.props.height;
        }



        // ctx.scale(ratio, ratio);
        // this._isEmpty = true;
    }

    _reset() {
        this._points = [];
        this._lastVelocity = 0;
        //this._lastWidth = (this._minStrokeWidth + this._maxStrokeWidth) / 2;
        this._isEmpty = true;
        this._ctx.fillStyle = this._penColor;
    }

    _handleMouseEvents() {
        this._mouseButtonDown = false;

        this._canvas.addEventListener("mousedown", this._handleMouseDown.bind(this));
        this._canvas.addEventListener("mousemove", this._handleMouseMove.bind(this));
        document.addEventListener("mouseup", this._handleMouseUp.bind(this));
        window.addEventListener("resize", this._resizeCanvas.bind(this));
    }

    _handleTouchEvents() {
        // Pass touch events to canvas element on mobile IE.
        this._canvas.style.msTouchAction = "none";

        this._canvas.addEventListener("touchstart", this._handleTouchStart.bind(this));
        this._canvas.addEventListener("touchmove", this._handleTouchMove.bind(this));
        document.addEventListener("touchend", this._handleTouchEnd.bind(this));
    }

    off() {
        this._canvas.removeEventListener("mousedown", this._handleMouseDown);
        this._canvas.removeEventListener("mousemove", this._handleMouseMove);
        document.removeEventListener("mouseup", this._handleMouseUp);

        this._canvas.removeEventListener("touchstart", this._handleTouchStart);
        this._canvas.removeEventListener("touchmove", this._handleTouchMove);
        document.removeEventListener("touchend", this._handleTouchEnd);

        window.removeEventListener("resize", this._resizeCanvas);
    }

    _handleMouseDown(event: any) {
        if (event.which === 1) {
            this._mouseButtonDown = true;
            this._strokeBegin(event);
        }
    }

    _handleMouseMove(event: any) {
        if (this._mouseButtonDown) {
            this._strokeUpdate(event);
        }
    }

    _handleMouseUp(event: any) {
        if (event.which === 1 && this._mouseButtonDown) {
            this._mouseButtonDown = false;
            this._strokeEnd(event);
        }
    }

    _handleTouchStart(event: any) {
        let touch = event.changedTouches[0];
        this._strokeBegin(touch);
    }

    _handleTouchMove(event: any) {
        // Prevent scrolling.
        event.preventDefault();

        let touch = event.changedTouches[0];
        this._strokeUpdate(touch);
    }

    _handleTouchEnd(event: any) {
        let wasCanvasTouched = event.target === this._canvas;
        if (wasCanvasTouched) {
            this._strokeEnd(event);
        }
    }

    _strokeUpdate(event: any) {
        let point = this._createPoint(event);
        this._addPoint(point);
    }

    _strokeBegin(event: any) {
        this._reset();
        this._strokeUpdate(event);
        if (typeof this._onBegin === "function") {
            this._onBegin(event);
        }
    }

    _strokeDraw(point: Point) {
        let ctx = this._ctx,
            dotSize = typeof(this._dotSize) === "function" ? this._dotSize() : this._dotSize;

        ctx.beginPath();
        this._drawPoint(point.x, point.y, dotSize);
        ctx.closePath();
        ctx.fill();
    }

    _strokeEnd(event: any) {
        let canDrawCurve = this._points.length > 2,
            point = this._points[0];

        if (!canDrawCurve && point) {
            this._strokeDraw(point);
        }
        if (typeof this._onEnd === "function") {
            this._onEnd(event);
        }
    }

    _createPoint(event: any) {
        let rect = this._canvas.getBoundingClientRect();
        return new Point(
            event.clientX - rect.left,
            event.clientY - rect.top
        );
    }

    _addPoint(point: any) {
        let points = this._points,
            c2, c3,
            curve, tmp;

        points.push(point);

        if (points.length > 2) {
            // To reduce the initial lag make it work with 3 _points
            // by copying the first point to the beginning.
            if (points.length === 3) points.unshift(points[0]);

            tmp = this._calculateCurveControlPoints(points[0], points[1], points[2]);
            c2 = tmp.c2;
            tmp = this._calculateCurveControlPoints(points[1], points[2], points[3]);
            c3 = tmp.c1;
            curve = new BezierCurve(points[1], c2, c3, points[2]);
            this._addCurve(curve);

            // Remove the first element from the list,
            // so that we always have no more than 4 _points in _points array.
            points.shift();
        }
    }

    _calculateCurveControlPoints(s1: Point, s2: Point, s3: Point) {
        let dx1 = s1.x - s2.x, dy1 = s1.y - s2.y,
            dx2 = s2.x - s3.x, dy2 = s2.y - s3.y,

            m1 = {x: (s1.x + s2.x) / 2.0, y: (s1.y + s2.y) / 2.0},
            m2 = {x: (s2.x + s3.x) / 2.0, y: (s2.y + s3.y) / 2.0},

            l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1),
            l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2),

            dxm = (m1.x - m2.x),
            dym = (m1.y - m2.y),

            k = l2 / (l1 + l2),
            cm = {x: m2.x + dxm * k, y: m2.y + dym * k},

            tx = s2.x - cm.x,
            ty = s2.y - cm.y;

        return {
            c1: new Point(m1.x + tx, m1.y + ty),
            c2: new Point(m2.x + tx, m2.y + ty)
        };
    }

    _addCurve(curve: BezierCurve) {
        let startPoint = curve.startPoint,
            endPoint = curve.endPoint,
            velocity, newWidth;

        velocity = endPoint.velocityFrom(startPoint);
        velocity = this._velocityFilterWeight * velocity
            + (1 - this._velocityFilterWeight) * this._lastVelocity;

        newWidth = this._strokeWidth(velocity);
        this._drawCurve(curve, this._lastWidth, newWidth);

        this._lastVelocity = velocity;
        this._lastWidth = newWidth;
    }

    _drawPoint(x: number, y: number, size: number) {
        let ctx = this._ctx;

        ctx.moveTo(x, y);
        ctx.arc(x, y, size, 0, 2 * Math.PI, false);
        this._isEmpty = false;
    }

    _drawCurve(curve: BezierCurve, startWidth: number, endWidth: number) {
        let ctx = this._ctx,
            widthDelta = endWidth - startWidth,
            drawSteps, width, i, t, tt, ttt, u, uu, uuu, x, y;

        drawSteps = Math.floor(curve.length());
        ctx.beginPath();
        for (i = 0; i < drawSteps; i++) {
            // Calculate the Bezier (x, y) coordinate for this step.
            t = i / drawSteps;
            tt = t * t;
            ttt = tt * t;
            u = 1 - t;
            uu = u * u;
            uuu = uu * u;

            x = uuu * curve.startPoint.x;
            x += 3 * uu * t * curve.control1.x;
            x += 3 * u * tt * curve.control2.x;
            x += ttt * curve.endPoint.x;

            y = uuu * curve.startPoint.y;
            y += 3 * uu * t * curve.control1.y;
            y += 3 * u * tt * curve.control2.y;
            y += ttt * curve.endPoint.y;

            width = startWidth + ttt * widthDelta;
            this._drawPoint(x, y, width);
        }
        ctx.closePath();
        ctx.fill();
    }

    _strokeWidth(velocity: number) {
        return Math.max(this._maxStrokeWidth / (velocity + 1), this._minStrokeWidth);
    }

    render() {
        const {style, className, showFullScreen, width, height, fullScreenCloseAction} = this.props;

        let newWidth: number = showFullScreen ? null : width;
        let newHeight: number = showFullScreen ? null : height;

        console.log(this.props);
        return (
            <div
                className={classnames(className, showFullScreen && styles.SignaturePadFullScreen)}
                style={{width: newWidth, height: newHeight, backgroundColor: this._backgroundColor, ...style}}>
                <canvas ref={this._canvasRef} />
                {
                    showFullScreen ?
                        fullScreenCloseAction : null
                }
            </div>
        );
    }

}

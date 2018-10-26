export default class Point {

    constructor(public readonly x: number,
                public readonly y: number,
                public readonly time: number = new Date().getTime()) {

    }

    velocityFrom(start: Point) {
        return (this.time !== start.time) ? this.distanceTo(start) / (this.time - start.time) : 1;
    }

    distanceTo(start: Point) {
        return Math.sqrt(Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2));
    }

}

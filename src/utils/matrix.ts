import {
  identity,
  multiply,
  perspective,
  translate,
  translate3d,
  rotateY,
  toString
} from 'rematrix';

export default class Matrix {
  m: number[];

  constructor(arg?: Matrix | number[]) {
    if (arg) {
      if ('m' in arg) {
        this.m = [...arg.m];
      } else {
        this.m = [...arg];
      }
    } else {
      this.m = identity();
    }
  }

  clone(): Matrix {
    return new Matrix(this);
  }

  multiply(m: number[]): void {
    this.m = multiply(this.m, m);
  }

  perspective(d: number): void {
    this.multiply(perspective(d));
  }

  transformX(x: number): number {
    return (x * this.m[0] + this.m[12]) / (x * this.m[3] + this.m[15]);
  }

  translate(x: number, y: number): void {
    this.multiply(translate(x, y));
  }

  translate3d(x: number, y: number, z: number): void {
    this.multiply(translate3d(x, y, z));
  }

  rotateY(deg: number): void {
    this.multiply(rotateY(deg));
  }

  toString(): string {
    return toString(this.m);
  }
}
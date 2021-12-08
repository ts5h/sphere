export default class Canvas {
  private canvas: any;
  private readonly ctx: any;
  private wrapper: any;

  constructor(elementID: string) {
    this.canvas = document.getElementById(elementID)
    this.wrapper = this.canvas.closest("div")
    this.ctx = null

    this.initCanvas()
  }

  initCanvas(): void {
    this.resizeCanvas()

    // 3D
    //this.ctx = this.canvas.getContext('2d');
  }

  resizeCanvas(): void {
    const ww = this.wrapper.offsetWidth.toString()
    const wh = this.wrapper.offsetHeight.toString()
    this.canvas.setAttribute("width", ww)
    this.canvas.setAttribute("height", wh)
    this.canvas.style.width = ww + "px"
    this.canvas.style.height = wh + "px"
  }

  getWindowWidth(): number {
    return this.canvas.offsetWidth
  }

  getWindowHeight(): number{
    return this.canvas.offsetHeight
  }

  getContext(): HTMLCanvasElement {
    return this.ctx;
  }
}
// Add declaration for page-flip module
declare module 'page-flip' {
  export class PageFlip {
    constructor(element: HTMLElement, options: PageFlipOptions)

    on(eventName: string, callback: (e: any) => void): void
    off(eventName: string, callback: (e: any) => void): void

    loadFromHTML(elements: NodeListOf<Element> | HTMLElement[]): void
    loadFromImages(images: string[]): void
    updateFromHTML(elements: NodeListOf<Element> | HTMLElement[]): void
    updateFromImages(images: string[]): void

    flipNext(corner?: 'top' | 'bottom'): void
    flipPrev(corner?: 'top' | 'bottom'): void
    flip(pageIndex: number, corner?: 'top' | 'bottom'): void

    turnToPage(pageIndex: number): void
    turnToNextPage(): void
    turnToPrevPage(): void

    getPageCount(): number
    getCurrentPageIndex(): number
    getOrientation(): 'portrait' | 'landscape'
    getBoundsRect(): { left: number, top: number, width: number, height: number }

    destroy(): void
  }

  export interface PageFlipOptions {
    width: number
    height: number
    size?: 'fixed' | 'stretch'
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
    drawShadow?: boolean
    flippingTime?: number
    usePortrait?: boolean
    startZIndex?: number
    startPage?: number
    autoSize?: boolean
    maxShadowOpacity?: number
    showCover?: boolean
    mobileScrollSupport?: boolean
    swipeDistance?: number
    clickEventForward?: boolean
    useMouseEvents?: boolean
    disableFlipByClick?: boolean
  }
}

import {IImageUtil} from './IImageUtil';

export class ImageUtil implements IImageUtil {

    /**
     * Appropriate for browsers. Uses a canvas element to base64
     * encode the image.
     *
     * @param {HTMLImageElement} img
     * @param {(response: any) => void} onEncode
     */
    public getBase64Image(img: HTMLImageElement, onEncode: (response: any) => void): string | void {
        // Create an empty canvas element
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Copy the image contents to the canvas
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Get the data-URL formatted image
        // Firefox supports PNG and JPEG. You could check img.src to
        // guess the original format, but be aware the using "image/jpg"
        // will re-encode the image.
        const dataURL = canvas.toDataURL("image/png");
        onEncode(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
    }

    /**
     * Appropriate for browsers.  Uses an image tag and the load event to load an image from a url.
     *
     * @param {string} url
     * @param {(image: any) => void} onLoad
     * @param {(errorMessage: string) => void} onError
     */
    public loadImageFromURL(url: string, onLoad: (image: any) => void, onError: (errorMessage: string) => void) {
        const image = new Image();
        const imageLoadHandler = () => {
            if (onLoad) {
                onLoad(image);
            }
            clearEventListeners();
        };
        const imageErrorHandler = () => {
            if (onError) {
                onError(`An Image could not be loaded. Please check that the URL (${url}) is accessible.`);
            }
            clearEventListeners();
        };
        const clearEventListeners = () => {
            image.removeEventListener("load", imageLoadHandler);
            image.removeEventListener("error", imageErrorHandler);
        }
        image.addEventListener("load", imageLoadHandler);
        image.addEventListener("error", imageErrorHandler);
        image.crossOrigin = "Anonymous";
        image.src = url;
    }

}
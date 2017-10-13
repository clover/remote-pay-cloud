import {IImageUtil} from './IImageUtil';

export class ImageUtil implements IImageUtil {

    /**
     *  Appropriate for browsers.
     *
     * @param img - an image.  Can be obtained in a manner similar to :
     *  <pre>var img = document.getElementById("img_id");</pre>
     * @returns {string} a base 64 encoded string of the image.
     */
    public getBase64Image(img: HTMLImageElement): string {
        // Create an empty canvas element
        var canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Copy the image contents to the canvas
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Get the data-URL formatted image
        // Firefox supports PNG and JPEG. You could check img.src to
        // guess the original format, but be aware the using "image/jpg"
        // will re-encode the image.
        var dataURL = canvas.toDataURL("image/png");

        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }

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
/**
 * Interface used to abstract implementation details to allow for NodeJS and
 * Browser usage of the library.
 *
 */
export interface IImageUtil {

    /**
     * Returns a base64 encoded string for an image.
     *
     * @param img - an image.
     * @returns {string} a base 64 encoded string of the image.
     */
    getBase64Image(img: HTMLImageElement, onEncode: (response: any) => void): void;

    /**
     * Loads an image from a URL.
     *
     * @param {string} url
     * @param {(Image) => {}} onLoad
     * @param {(any) => {}} onError
     */
    loadImageFromURL(url: string,  onLoad: (image: any) => void, onError: (errorMessage: string) => void): void;

}

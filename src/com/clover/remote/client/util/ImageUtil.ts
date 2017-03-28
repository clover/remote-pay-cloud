
export class ImageUtil {

    /**
     *  Appropriate for browsers.
     *
     * @param img - an image.  Can be obtained in a manner similar to :
     *  <pre>var img = document.getElementById("img_id");</pre>
     * @returns {string} a base 64 encoded string of the image.
     */
    static getBase64Image(img: HTMLImageElement): string {
        // Create an empty canvas element
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

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
}
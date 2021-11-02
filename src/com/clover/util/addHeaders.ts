export const addHeaders = (headers, xmlHttp) => {
    if (headers) {
        for (let key in headers) {
            if (headers.hasOwnProperty(key)) {
                xmlHttp.setRequestHeader(key, headers[key]);
            }
        }
    }
}
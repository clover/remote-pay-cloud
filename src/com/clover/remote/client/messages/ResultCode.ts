/**
 * The result of the Response objects used in the
 * callbacks from the Mini
 */
export enum ResultCode {
  SUCCESS, // this means the call succeeded and was successfully queued or processed
  FAIL, // this means it failed because of some value passed in, or it failed for an unknown reason
  UNSUPPORTED, // this means the capability will never work without a config change
  CANCEL, // this means the call was canceled for some reason, but could work if re-submitted
  ERROR // an error was encountered that wasn't expected or handled appropriately
}

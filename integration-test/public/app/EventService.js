import Rx from "rxjs";

const testObservable = new Rx.Subject();
const pairingObservable = new Rx.Subject();
const get = () => {

    return {
        testObservable: testObservable,
        pairingObservable: pairingObservable
    }
};

export {get}

import Rx from 'rxjs'

const testObservable = new Rx.Subject();
const pairingObservable = new Rx.Subject();
const create = () => {

    return {
        testObservable: testObservable,
        pairingObservable: pairingObservable
    }
};

export {create}

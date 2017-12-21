import { Subject } from "rxjs/Subject";

const EventService = {
    testObservable: new Subject(),
    pairingObservable: new Subject()
};

export default EventService;
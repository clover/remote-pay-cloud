// create() returns the public interface.
const makeIterator = (array) => {
    var nextIndex = 0;

    return {
        next: function() {
            return nextIndex < array.length ?
                {value: array[nextIndex++], done: false} :
                {done: true};
        },

        hasNext: function() {
            if (!array || array.length === 0) {
                return false;
            }
            return nextIndex < array.length;
        }
    };

};

export {makeIterator}
const TestContext = {
    currentTestExecutor: null,

    getCurrentTestExecutor: function () {
        return this.currentTestExecutor;
    },

    setCurrentTestExecutor: function (executor) {
        this.currentTestExecutor = executor;
    }
};

export default TestContext;
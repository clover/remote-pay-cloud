# Integration Test

Contains a web application and our automated test engine both of which are intended for Clover internal use.
The web application is a driver and reporting mechanism for our test engine.  These tests require a connection to a Clover device and exercise the SDK as well as Cloud and Network Pay Display.

# Requirements
This application relies on:

- integration-test/app/public/testConfig.json - You must create this file.  See exampleTestConfig.json as a starting point.  The example file contains properties for both cloud and network configurations. Unless you have multiple devices you will want to run one configuration (cloud or network) at a time.
- JSON test definitions that are pulled from an internal/private Clover project called Pidgin (pidgin-test).allows for manual execution of our automated test suite.  It assumes the test-definitions-api REST service is running on localhost:3001.

Run:
```
gradlew build startTestApp
```
and navigate to <a href="http://localhost:3000">localhost:3000<a>


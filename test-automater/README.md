# Test Automater

This application allows for manual execution of our automated test suite.  It assumes the test-definitions are being served from localhost:3001.

Run:
```
gradlew build start
```
and navigate to <a href="http://localhost:3000">localhost:3000<a>

Alternate helpful tasks include:

```
gradlew watch
```
which will run webpack with the watch option. Task will never finish but it auto-bundles the app so you can F5 the app and see the changes.
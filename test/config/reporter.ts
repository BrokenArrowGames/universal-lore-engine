import {
  AggregatedResult,
  Config,
  Reporter,
  ReporterOnStartOptions,
  Test,
  TestContext,
  TestResult,
} from '@jest/reporters';

export default class JestReporter implements Reporter {
  constructor(
    private readonly globalConfig: Config.GlobalConfig,
    private readonly options?: any,
  ) {}

  onTestStart(_test: Test): void {
    // console.log("test start");
  }

  onRunStart(_results: AggregatedResult, _options: ReporterOnStartOptions) {
    // console.log("start");
  }

  onTestResult(
    _test: Test,
    _testResult: TestResult,
    _aggregatedResult: AggregatedResult,
  ) {
    // console.log("test done");
  }

  onRunComplete(_testContexts: Set<TestContext>, results: AggregatedResult) {
    // console.log("done");
    if (results.numFailedTestSuites) {
      console.log(
        results.testResults
          .filter((tst) => tst.failureMessage)
          .map((tst) => tst.failureMessage)
          .join('\n'),
      );
      console.log('failed suites', results.numFailedTestSuites);
      console.log('failed tests', results.numFailedTests);
    }
  }
}

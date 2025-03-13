import { DynamicExecutor } from "@nestia/e2e";
import chalk from "chalk";
import { ArgumentParser } from "./helpers/ArgumentParser";

interface IOptions {
  include?: string[];
  exclude?: string[];
}

const getOptions = () =>
  ArgumentParser.parse<IOptions>(async (command, prompt, action) => {
    command.option("--include <string...>", "include feature files");
    command.option("--exclude <string...>", "exclude feature files");

    prompt;

    return action(async (options) => {
      return options;
    });
  });

async function main(): Promise<void> {
  const options: IOptions = await getOptions();

  //----
  // CLINET CONNECTOR
  //----
  // DO TEST
  const report: DynamicExecutor.IReport = await DynamicExecutor.validate({
    parameters: () => [],
    prefix: "test",
    location: __dirname + "/features",
    filter: (func) =>
      (!options.include?.length || (options.include ?? []).some((str) => func.includes(str))) &&
      (!options.exclude?.length || (options.exclude ?? []).every((str) => !func.includes(str))),
    onComplete: (exec) => {
      const trace = (str: string) => console.log(`  - ${chalk.green(exec.name)}: ${str}`);
      if (exec.error === null) {
        const elapsed: number = new Date(exec.completed_at).getTime() - new Date(exec.started_at).getTime();
        trace(`${chalk.yellow(elapsed.toLocaleString())} ms`);
      } else trace(chalk.red(exec.error.name));
    },
  });

  const failures: DynamicExecutor.IExecution[] = report.executions.filter((exec) => exec.error !== null);
  if (failures.length === 0) {
    console.log("Success");
    console.log("Elapsed time", report.time.toLocaleString(), `ms`);
  } else {
    for (const f of failures) console.log(f.error);
    process.exit(-1);
  }

  console.log(
    [
      `All: #${report.executions.length}`,
      `Success: #${report.executions.length - failures.length}`,
      `Failed: #${failures.length}`,
    ].join("\n")
  );
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});

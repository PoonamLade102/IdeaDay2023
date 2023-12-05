import { DataSource } from "typeorm";
import { SqlDatabase } from "langchain/sql_db";
import { PromptTemplate } from "langchain/prompts";
import { RunnableSequence } from "langchain/schema/runnable";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { StringOutputParser } from "langchain/schema/output_parser";
import dotenv from "dotenv";

dotenv.config();

const run = async (input) => {
    /**
 * This example uses Chinook database, which is a sample database available for SQL Server, Oracle, MySQL, etc.
 * To set it up follow the instructions on https://database.guide/2-sample-databases-sqlite/, placing the .db file
 * in the examples folder.
 */
const datasource = new DataSource({
    type: "sqlite",
    database: "database/Chinook.db",
  });
  
  const db = await SqlDatabase.fromDataSourceParams({
    appDataSource: datasource,
  });
  
  const llm = new ChatOpenAI();
  
  /**
   * Create the first prompt template used for getting the SQL query.
   */
  const prompt =
    PromptTemplate.fromTemplate(`Based on the provided SQL table schema below, write a SQL query that would answer the user's question.Just take the table name as a signular
  ------------
  SCHEMA: {schema}
  ------------
  QUESTION: {question}
  ------------
  SQL QUERY:`);
  /**
   * You can also load a default prompt by importing from "langchain/sql_db"
   *
   * import {
   *   DEFAULT_SQL_DATABASE_PROMPT
   *   SQL_POSTGRES_PROMPT
   *   SQL_SQLITE_PROMPT
   *   SQL_MSSQL_PROMPT
   *   SQL_MYSQL_PROMPT
   *   SQL_SAP_HANA_PROMPT
   * } from "langchain/sql_db";
   *
   */
  
  /**
   * Create a new RunnableSequence where we pipe the output from `db.getTableInfo()`
   * and the users question, into the prompt template, and then into the llm.
   * We're also applying a stop condition to the llm, so that it stops when it
   * sees the `\nSQLResult:` token.
   */
  const sqlQueryChain = RunnableSequence.from([
    {
      schema: async () => db.getTableInfo(),
      question: (input) => input.question,
    },
    prompt,
    llm.bind({ stop: ["\nSQLResult:"] }),
    new StringOutputParser(),
  ]);

  const tableinfo = db.getTableInfo().then(function(result) {
    console.log("This is table info result")
    console.log(result); // "initResolve"
    return result;
  });

  console.log(tableinfo);
  
  
  const res = await sqlQueryChain.invoke({
    question: "Get customer details of a customer named Leonie ",
  });
  console.log({ res });
  
  /**
   * { res: 'SELECT COUNT(*) FROM tracks;' }
   */
  
  /**
   * Create the final prompt template which is tasked with getting the natural language response.
   */
  const finalResponsePrompt =
    PromptTemplate.fromTemplate(`Based on the table schema below, question, SQL query, and SQL response, write a natural language response . Just take the table name as a signular:
  ------------
  SCHEMA: {schema}
  ------------
  QUESTION: {question}
  ------------
  SQL QUERY: {query}
  ------------
  SQL RESPONSE: {response}
  ------------
  NATURAL LANGUAGE RESPONSE:`);
  
  /**
   * Create a new RunnableSequence where we pipe the output from the previous chain, the users question,
   * and the SQL query, into the prompt template, and then into the llm.
   * Using the result from the `sqlQueryChain` we can run the SQL query via `db.run(input.query)`.
   */
  const finalChain = RunnableSequence.from([
    {
      question: (input) => input.question,
      query: sqlQueryChain,
    },
    {
      schema: async () => db.getTableInfo(),
      question: (input) => input.question,
      query: (input) => input.query,
      response: (input) => db.run(input.query),
    },
    finalResponsePrompt,
    llm,
    new StringOutputParser(),
  ]);
  
  const finalResponse = await finalChain.invoke({
    question: "Get customer details of a customer named Leonie ",
  });
  
  console.log({ finalResponse });
  return finalChain

    return res;
  /**
   * { finalResponse: 'There are 8 employees.' }
   */
};
export default run;

import { OpenAI } from "langchain/llms/openai";
import { SqlDatabase } from "langchain/sql_db";
import { createSqlAgent, SqlToolkit } from "langchain/agents/toolkits/sql";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import mysql from "mysql";

dotenv.config();

const run = async (input) => {
    const dbconfig = {
        type: 'mysql',
        user: 'sa',
        password: '~$ystem32',
        server: 'localhost',
        database: 'pets',
      };

      
    var connection = mysql.createConnection({
    host     : 'GWT5LL3-L',
    user     : 'sa',
    password : '~$ystem32',
    database : 'pets'
    });

    connection.connect();

    connection.query('SELECT * from cats', function (error, results) {
    if (error) throw error;
    console.log('The solution is: ', results);
    });

    // const db = await SqlDatabase.fromDataSourceParams({
    //       appDataSource: connection,
    //   });
    const toolkit = new SqlToolkit(connection);
    const model = new OpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0
    });

    const executor = createSqlAgent(model, toolkit);

    //input = 'List all Employee.';

    console.log('Input->', {input});

    const result = await executor.call({ input });

    console.log(`Result: ${result.output}`);

    console.log(`Result: ${JSON.stringify(result.output)}`);


    console.log(`Intermediate Steps: ${JSON.stringify(
        result.intermediateSteps,
        null,
        2
    )}`);

    //await datasource.destroy();

    return result.output;
};
export default run;
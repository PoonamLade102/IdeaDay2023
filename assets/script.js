import { OpenAI } from "langchain/llms/openai";
import { SqlDatabase } from "langchain/sql_db";
import { createSqlAgent, SqlToolkit } from "langchain/agents/toolkits/sql";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import fs from "fs";
import mysql from "mysql";

dotenv.config();

// const createDataSource = async () => {
//     return new DataSource({
//         type: "sqlite",
//         database: "database/Chinook_MySql"
//     });
// };

// const initializeDatabase = async (dataSource) => {
//     const db = await SqlDatabase.fromDataSourceParams({
//         appDataSource: dataSource,
//     });
//     return db;
// };

// const createOpenAIModel = () => {
//     return new OpenAI({
//         openAIApiKey: process.env.OPENAI_API_KEY,
//         temperature: 0
//     });
// };


// const executeQuery = async (executor, input) => {
//     console.log('Input->', { input });
//     const result = await executor.call({ input });
//     console.log('Result ->', { result });
//     console.log(`Intermediate Steps: ${JSON.stringify(result.intermediateSteps, null, 2)}`);
//     return result;
// };

// const destroyDataSource = async (dataSource) => {
//     await dataSource.destroy();
// };

// const run = async (input) => {
//     const dataSource = createDataSource();
//     const db = await initializeDatabase(dataSource);
    
//     const model = createOpenAIModel();
//     const toolkit = new SqlToolkit(db,model);
//     const executor = createSqlAgent(model, toolkit);

//     const result = await executeQuery(executor, input);

//     await destroyDataSource(dataSource);

//     return result;
// };

// run();

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

    connection.query('SELECT * from cats', function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
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

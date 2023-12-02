import { OpenAI } from "langchain/llms/openai";
import { SqlDatabase } from "langchain/sql_db";
import { createSqlAgent, SqlToolkit } from "langchain/agents/toolkits/sql";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import fs from "fs";
import mysql from "mysql2";

dotenv.config();

const run = async (input) => {
    const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'sa',
    password : '~$ystem32',
    database : 'chinook'
    });

    connection.connect((error) => {
        if (error) {
          console.error('Error connecting to MySQL database:', error);
        } else {
          console.log('Connected to MySQL database!');
        }
      });

    // connection.query('SELECT * from cats', function (error, results) {
    // if (error) throw error;
    // console.log('The solution is: ', results);
    // });

    //  const db = await SqlDatabase.fromDataSourceParams({
    //        appDataSource: connection,
    //    });
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

    
    await connection.end();

    return result.output;
};
export default run;

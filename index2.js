import { OpenAI } from "langchain/llms/openai";
import { SqlDatabase } from "langchain/sql_db";
import { createSqlAgent, SqlToolkit } from "langchain/agents/toolkits/sql";
import { DataSource } from "typeorm";

import dotenv from "dotenv";
dotenv.config();

const run = async () => {
    const datasource = new DataSource({
        type: "sqlite",
        database: "database/Chinook_MySql"
    });
    const db = await SqlDatabase.fromDataSourceParams({
        appDataSource: datasource,
    });
    const toolkit = new SqlToolkit(db);
    const model = new OpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0
    });

    const executor = createSqlAgent(model, toolkit);

    const input = 'RENAME all Employee';

    let result;

    const lowercaseInput = input.toLowerCase();

    if (lowercaseInput.includes('change') || lowercaseInput.includes('rename') 
    || lowercaseInput.includes('insert') || lowercaseInput.includes('update') 
    || lowercaseInput.includes('delete') || lowercaseInput.includes('drop')) {
        result = 'DML Operations are not supported';
    }
    else {
        result = await executor.call({ input });
    }

    console.log('Input->', {input});

    console.log('Result ->', {result});

    console.log(`Intermediate Steps: ${JSON.stringify(
        result.intermediateSteps,
        null,
        2
    )}`);

    await datasource.destroy();
};

await run();
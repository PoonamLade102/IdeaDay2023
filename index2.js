import { OpenAI } from "langchain/llms/openai";
import { SqlDatabase } from "langchain/sql_db";
import { createSqlAgent, SqlToolkit } from "langchain/agents/toolkits/sql";
import { DataSource } from "typeorm";

import dotenv from "dotenv";
import fs from "fs";
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

    const input = 'List all Album.';

    console.log('Input->', {input});

    const result = await executor.call({ input });

    console.log('Result ->', {result});

    console.log(`Intermediate Steps: ${JSON.stringify(
        result.intermediateSteps,
        null,
        2
    )}`);

    await datasource.destroy();
};

await run();
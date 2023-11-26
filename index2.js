import { OpenAI } from "langchain";
import { SqlDatabase } from "langchain/dist/sql_db";
import { createSqlAgent, SqlToolkit } from "langchain/agents";
import { DataSource } from 'typeorm';

const run = async () => {
    const datasource = new DataSource({
        type: "mysql",
        database: "./Chinook_MySql"
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

    const input = 'SQL Query';

    console.log('Input-> "${input}"');

    const result = await executor.call({ input });

    await datasource.destroy();
};

await run();
import { DataSource } from "typeorm";
import { SqlDatabase } from "langchain/sql_db";
import { PromptTemplate } from "langchain/prompts";
import { RunnableSequence } from "langchain/schema/runnable";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { StringOutputParser } from "langchain/schema/output_parser";
import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

class Database {
  constructor() {
    this.connection = mysql.createConnection({
      host: "localhost",
      user: "sa",
      password: "~$ystem32",
      database: "chinook",
    });
  }
  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, args, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
  close() {
    return new Promise((resolve, reject) => {
      this.connection.end((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

const run = async (res, input) => {
  let explanationString, query_string , query_output;
  
  //Schema Generator
  const database = new Database();

  database
    .query(
      `
    SELECT 
  t.table_name AS TableName,
  GROUP_CONCAT(c.column_name ORDER BY c.ordinal_position) AS ColumnNames,
  GROUP_CONCAT(kcu.referenced_table_name, '.', kcu.referenced_column_name ORDER BY kcu.position_in_unique_constraint) AS RelatedTablesAndColumns
FROM 
  information_schema.tables t
JOIN 
  information_schema.columns c ON t.table_schema = c.table_schema AND t.table_name = c.table_name
LEFT JOIN 
  information_schema.key_column_usage kcu ON t.table_schema = kcu.table_schema AND t.table_name = kcu.table_name AND c.column_name = kcu.column_name
WHERE 
  t.table_schema = 'chinook' -- Replace with your database name
GROUP BY 
  t.table_name;
    `
    )
    .then(async (rows) => {
      explanationString = "Database Schema Explanation:\n";
      rows.forEach((table) => {
        explanationString += `\nTable: ${table.TableName}\n`;

        if (table.ColumnNames !== null && table.ColumnNames !== "") {
          const columns = table.ColumnNames.split(",");
          explanationString += `Columns: ${columns.join(", ")}\n`;
        } else {
          explanationString += "No columns\n";
        }

        if (
          table.RelatedTablesAndColumns !== null &&
          table.RelatedTablesAndColumns !== ""
        ) {
          const relationships = table.RelatedTablesAndColumns.split(", ");
          relationships.forEach((relation) => {
            const [tableName, columnName] = relation.split(".");
            explanationString += `Linked to ${tableName} using ${columnName}\n`;
          });
        } else {
          explanationString += "No relationships\n";
        }

        explanationString += "\n";
      });

      //Query Generator
      const llm = new ChatOpenAI();

      const prompt =
        PromptTemplate.fromTemplate(`Based on the provided SQL table schema below, write a SQL query that would answer the user's question.Just take the table name as a signular
  ------------
  SCHEMA: {schema}
  ------------
  QUESTION: {question}
  ------------
  SQL QUERY:`);

      const sqlQueryChain = RunnableSequence.from([
        {
          schema: (input) => input.schema,
          question: (input) => input.question,
        },
        prompt,
        llm.bind({ stop: ["\nSQLResult:"] }),
        new StringOutputParser(),
      ]);

      query_string = await sqlQueryChain.invoke({
        schema: explanationString,
        question: input,
      });

      //run query

      return database.query(query_string);
    })
    .then((rows)=>{
      query_output = rows;
      return database.close();
    })
    .then(() => {
      let Result = {
        query_string,
        query_output,
      };
      res.send(Result)
    });
  return;
};
export default run;

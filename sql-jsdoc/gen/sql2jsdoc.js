//@ts-check
import { Parser } from "node-sql-parser";

export function gen(code) {
  const parser = new Parser();
  const ast = parser.astify(code);
  const table_name = ast.table[0].table;
  const res = ast.create_definitions
    .filter((x) => x.column)
    .map((col) => {
      if (col.definition.dataType === "ENUM") {
        return {
          Field: col.column.column,
          jsType: col.definition.expr.value
            .map((x) => `'${x.value}'`)
            .join("|"),
        };
      }
      return {
        Field: col.column?.column,
        jsType: parseType(col.definition.dataType),
      };
    });
  const typeName = CapitalizeFirst(toCamelCase(table_name));
  let jsDoc = [`/**`, ` * @typedef ${typeName}`];
  jsDoc.push(...res.map((c) => ` * @property {${c.jsType}} ${c.Field}`));
  jsDoc.push("**/");

  let str = jsDoc.join("\n");
  return str;
}

function parseType(type) {
  const TYPES = {
    // Affinity number:
    INT: "number",
    TINYINT: "number",
    SMALLINT: "number",
    MEDIUMINT: "number",
    BIGINT: "number",
    "UNSIGNED BIG INT": "number",
    INT2: "number",
    INT8: "number",

    // Affinity TEXT:
    CHAR: "string",
    CHARACTER: "string",
    VARCHAR: "string",
    "VARYING CHARACTER": "string",
    NCHAR: "string",
    "NATIVE CHARACTER": "string",
    NVARCHAR: "string",
    TEXT: "string",
    CLOB: "string",

    // Affinity NONE:
    BLOB: "string",

    // Affinity REAL:
    REAL: "number",
    DOUBLE: "number",
    "DOUBLE PRECISION": "number",
    FLOAT: "number",

    // Affinity NUMERIC:
    NUMERIC: "number",
    DECIMAL: "number",

    // Affinity NUMERIC, but JS type different:
    BOOLEAN: "boolean",
    DATE: "string",
    DATETIME: "string",
    JSON: "string",
  };
  return TYPES[type];
}

function toCamelCase(str) {
  // Lower cases the string
  return (
    str
      .toLowerCase()
      // Replaces any - or _ characters with a space
      .replace(/[-_]+/g, " ")
      // Removes any non alphanumeric characters
      .replace(/[^\w\s]/g, "")
      // Uppercases the first character in each group immediately following a space
      // (delimited by spaces)
      .replace(/ (.)/g, function ($1) {
        return $1.toUpperCase();
      })
      // Removes spaces
      .replace(/ /g, "")
  );
}

function CapitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

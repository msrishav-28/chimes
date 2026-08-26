/** Split a SQL file into statements, keeping $tag$ bodies intact. */
export function splitSqlStatements(sql) {
  const stmts = [];
  let buf = "";
  let i = 0;
  const s = String(sql || "");

  while (i < s.length) {
    if (s[i] === "-" && s[i + 1] === "-") {
      const nl = s.indexOf("\n", i);
      i = nl === -1 ? s.length : nl + 1;
      buf += "\n";
      continue;
    }
    if (s[i] === "/" && s[i + 1] === "*") {
      const end = s.indexOf("*/", i + 2);
      i = end === -1 ? s.length : end + 2;
      continue;
    }
    if (s[i] === "'") {
      buf += "'";
      i += 1;
      while (i < s.length) {
        if (s[i] === "'" && s[i + 1] === "'") {
          buf += "''";
          i += 2;
          continue;
        }
        buf += s[i];
        if (s[i] === "'") {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }
    const dollar = s.slice(i).match(/^\$[A-Za-z0-9_]*\$/);
    if (dollar) {
      const tag = dollar[0];
      const end = s.indexOf(tag, i + tag.length);
      if (end === -1) {
        buf += s.slice(i);
        break;
      }
      buf += s.slice(i, end + tag.length);
      i = end + tag.length;
      continue;
    }
    if (s[i] === ";") {
      const stmt = buf.trim();
      if (stmt) stmts.push(stmt);
      buf = "";
      i += 1;
      continue;
    }
    buf += s[i];
    i += 1;
  }
  const tail = buf.trim();
  if (tail) stmts.push(tail);
  return stmts;
}

#!/usr/bin/env node

/**
 * Count and categorize TODO comments
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📝 Analyzing TODO comments...\n');

try {
  const output = execSync(
    'grep -r "TODO\\|FIXME\\|XXX\\|HACK" src/ --include="*.tsx" --include="*.ts" -n',
    { encoding: 'utf8' }
  );

  const lines = output.trim().split('\n');
  const todos = lines.map(line => {
    const [file, lineNum, ...rest] = line.split(':');
    return {
      file: file.replace('src/', ''),
      line: lineNum,
      text: rest.join(':').trim(),
      type: line.includes('FIXME') ? 'FIXME' : 
            line.includes('XXX') ? 'XXX' : 
            line.includes('HACK') ? 'HACK' : 'TODO'
    };
  });

  // Group by type
  const byType = todos.reduce((acc, todo) => {
    acc[todo.type] = (acc[todo.type] || 0) + 1;
    return acc;
  }, {});

  // Group by file
  const byFile = todos.reduce((acc, todo) => {
    const dir = path.dirname(todo.file);
    acc[dir] = (acc[dir] || 0) + 1;
    return acc;
  }, {});

  console.log('📊 Summary:');
  console.log(`Total: ${todos.length} items\n`);

  console.log('By Type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  console.log('');

  console.log('By Directory:');
  Object.entries(byFile)
    .sort((a, b) => b[1] - a[1])
    .forEach(([dir, count]) => {
      console.log(`  ${dir}: ${count}`);
    });
  console.log('');

  console.log('Top 10 TODOs:');
  todos.slice(0, 10).forEach((todo, i) => {
    console.log(`${i + 1}. [${todo.type}] ${todo.file}:${todo.line}`);
    console.log(`   ${todo.text.substring(0, 80)}...`);
  });

} catch (error) {
  console.log('✅ No TODO comments found!');
}

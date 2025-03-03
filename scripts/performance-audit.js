#!/usr/bin/env node

/**
 * Performance audit script for SERETS.CO.IL
 * 
 * This script runs Lighthouse audits on key pages and generates a report
 * with performance metrics and recommendations.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.AUDIT_URL || 'http://localhost:3000';
const PAGES_TO_AUDIT = [
  '/',
  '/en/movies',
  '/en/theaters',
  '/en/actors',
  '/he/movies',
  '/he/theaters'
];
const OUTPUT_DIR = path.join(__dirname, '../performance-reports');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Create timestamp for this audit run
const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
const REPORT_DIR = path.join(OUTPUT_DIR, timestamp);
fs.mkdirSync(REPORT_DIR, { recursive: true });

console.log('🚀 Starting performance audit...');
console.log(`📊 Results will be saved to: ${REPORT_DIR}`);

// Summary data
const summary = {
  timestamp,
  pages: {},
  averages: {
    performance: 0,
    accessibility: 0,
    bestPractices: 0,
    seo: 0,
    fcp: 0,
    lcp: 0,
    cls: 0,
    tbt: 0,
    tti: 0
  }
};

// Run audits for each page
PAGES_TO_AUDIT.forEach((page, index) => {
  const pageUrl = `${BASE_URL}${page}`;
  const outputPath = path.join(REPORT_DIR, `${page.replace(/\//g, '-').replace(/^-/, '')}.json`);
  
  console.log(`\n📄 Auditing page ${index + 1}/${PAGES_TO_AUDIT.length}: ${pageUrl}`);
  
  try {
    // Run Lighthouse with specific configurations
    execSync(`npx lighthouse ${pageUrl} --output=json --output-path=${outputPath} --chrome-flags="--headless --disable-gpu --no-sandbox" --preset=desktop --throttling.cpuSlowdownMultiplier=2`);
    
    // Parse the results
    const report = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    const { audits, categories } = report;
    
    // Extract key metrics
    const metrics = {
      performance: categories.performance.score * 100,
      accessibility: categories.accessibility.score * 100,
      bestPractices: categories['best-practices'].score * 100,
      seo: categories.seo.score * 100,
      fcp: audits['first-contentful-paint'].numericValue,
      lcp: audits['largest-contentful-paint'].numericValue,
      cls: audits['cumulative-layout-shift'].numericValue,
      tbt: audits['total-blocking-time'].numericValue,
      tti: audits['interactive'].numericValue
    };
    
    // Add to summary
    summary.pages[page] = metrics;
    
    // Update averages
    summary.averages.performance += metrics.performance;
    summary.averages.accessibility += metrics.accessibility;
    summary.averages.bestPractices += metrics.bestPractices;
    summary.averages.seo += metrics.seo;
    summary.averages.fcp += metrics.fcp;
    summary.averages.lcp += metrics.lcp;
    summary.averages.cls += metrics.cls;
    summary.averages.tbt += metrics.tbt;
    summary.averages.tti += metrics.tti;
    
    console.log(`✅ Audit complete for ${page}`);
    console.log(`   Performance: ${metrics.performance.toFixed(0)}/100`);
    console.log(`   FCP: ${(metrics.fcp / 1000).toFixed(2)}s, LCP: ${(metrics.lcp / 1000).toFixed(2)}s, CLS: ${metrics.cls.toFixed(3)}`);
  } catch (error) {
    console.error(`❌ Error auditing ${page}:`, error.message);
    summary.pages[page] = { error: error.message };
  }
});

// Calculate averages
const pageCount = Object.keys(summary.pages).filter(page => !summary.pages[page].error).length;
if (pageCount > 0) {
  summary.averages.performance /= pageCount;
  summary.averages.accessibility /= pageCount;
  summary.averages.bestPractices /= pageCount;
  summary.averages.seo /= pageCount;
  summary.averages.fcp /= pageCount;
  summary.averages.lcp /= pageCount;
  summary.averages.cls /= pageCount;
  summary.averages.tbt /= pageCount;
  summary.averages.tti /= pageCount;
}

// Save summary
fs.writeFileSync(
  path.join(REPORT_DIR, 'summary.json'),
  JSON.stringify(summary, null, 2)
);

// Generate HTML report
const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Audit Report - ${timestamp}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #1a1a1a;
    }
    .summary {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric {
      background-color: white;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .metric h3 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 16px;
      color: #666;
    }
    .metric .value {
      font-size: 24px;
      font-weight: bold;
    }
    .pages {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .page {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .page h3 {
      margin-top: 0;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .score {
      display: inline-block;
      width: 40px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      border-radius: 50%;
      color: white;
      font-weight: bold;
      margin-right: 10px;
    }
    .good {
      background-color: #0cce6b;
    }
    .average {
      background-color: #ffa400;
    }
    .poor {
      background-color: #ff4e42;
    }
    .page-metrics {
      margin-top: 15px;
    }
    .page-metric {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .page-metric-name {
      color: #666;
    }
    .page-metric-value {
      font-weight: 500;
    }
    .error {
      color: #ff4e42;
      font-style: italic;
    }
  </style>
</head>
<body>
  <h1>Performance Audit Report</h1>
  <p>Generated on: ${new Date(timestamp).toLocaleString()}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <div class="metrics">
      <div class="metric">
        <h3>Performance</h3>
        <div class="value">${summary.averages.performance.toFixed(0)}/100</div>
      </div>
      <div class="metric">
        <h3>Accessibility</h3>
        <div class="value">${summary.averages.accessibility.toFixed(0)}/100</div>
      </div>
      <div class="metric">
        <h3>Best Practices</h3>
        <div class="value">${summary.averages.bestPractices.toFixed(0)}/100</div>
      </div>
      <div class="metric">
        <h3>SEO</h3>
        <div class="value">${summary.averages.seo.toFixed(0)}/100</div>
      </div>
      <div class="metric">
        <h3>First Contentful Paint</h3>
        <div class="value">${(summary.averages.fcp / 1000).toFixed(2)}s</div>
      </div>
      <div class="metric">
        <h3>Largest Contentful Paint</h3>
        <div class="value">${(summary.averages.lcp / 1000).toFixed(2)}s</div>
      </div>
      <div class="metric">
        <h3>Cumulative Layout Shift</h3>
        <div class="value">${summary.averages.cls.toFixed(3)}</div>
      </div>
      <div class="metric">
        <h3>Total Blocking Time</h3>
        <div class="value">${(summary.averages.tbt / 1000).toFixed(2)}s</div>
      </div>
      <div class="metric">
        <h3>Time to Interactive</h3>
        <div class="value">${(summary.averages.tti / 1000).toFixed(2)}s</div>
      </div>
    </div>
  </div>
  
  <h2>Page Results</h2>
  <div class="pages">
    ${Object.keys(summary.pages).map(page => {
      const metrics = summary.pages[page];
      if (metrics.error) {
        return `
          <div class="page">
            <h3>${page}</h3>
            <p class="error">Error: ${metrics.error}</p>
          </div>
        `;
      }
      
      const getScoreClass = (score) => {
        if (score >= 90) return 'good';
        if (score >= 50) return 'average';
        return 'poor';
      };
      
      return `
        <div class="page">
          <h3>${page}</h3>
          <div>
            <span class="score ${getScoreClass(metrics.performance)}">${metrics.performance.toFixed(0)}</span>
            Performance
          </div>
          <div class="page-metrics">
            <div class="page-metric">
              <span class="page-metric-name">First Contentful Paint</span>
              <span class="page-metric-value">${(metrics.fcp / 1000).toFixed(2)}s</span>
            </div>
            <div class="page-metric">
              <span class="page-metric-name">Largest Contentful Paint</span>
              <span class="page-metric-value">${(metrics.lcp / 1000).toFixed(2)}s</span>
            </div>
            <div class="page-metric">
              <span class="page-metric-name">Cumulative Layout Shift</span>
              <span class="page-metric-value">${metrics.cls.toFixed(3)}</span>
            </div>
            <div class="page-metric">
              <span class="page-metric-name">Total Blocking Time</span>
              <span class="page-metric-value">${(metrics.tbt / 1000).toFixed(2)}s</span>
            </div>
            <div class="page-metric">
              <span class="page-metric-name">Time to Interactive</span>
              <span class="page-metric-value">${(metrics.tti / 1000).toFixed(2)}s</span>
            </div>
          </div>
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>
`;

fs.writeFileSync(
  path.join(REPORT_DIR, 'report.html'),
  htmlReport
);

console.log('\n✨ Performance audit complete!');
console.log(`📊 Summary report saved to: ${path.join(REPORT_DIR, 'summary.json')}`);
console.log(`📊 HTML report saved to: ${path.join(REPORT_DIR, 'report.html')}`);
console.log(`\nAverage metrics:`);
console.log(`   Performance: ${summary.averages.performance.toFixed(0)}/100`);
console.log(`   Accessibility: ${summary.averages.accessibility.toFixed(0)}/100`);
console.log(`   Best Practices: ${summary.averages.bestPractices.toFixed(0)}/100`);
console.log(`   SEO: ${summary.averages.seo.toFixed(0)}/100`);
console.log(`   FCP: ${(summary.averages.fcp / 1000).toFixed(2)}s`);
console.log(`   LCP: ${(summary.averages.lcp / 1000).toFixed(2)}s`);
console.log(`   CLS: ${summary.averages.cls.toFixed(3)}`);
console.log(`   TBT: ${(summary.averages.tbt / 1000).toFixed(2)}s`);
console.log(`   TTI: ${(summary.averages.tti / 1000).toFixed(2)}s`);
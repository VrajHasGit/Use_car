const fs = require('fs');

const THEMES = {
  'black-darkblue': { name: 'OBSIDIAN', desc: 'Dark / Blue',
    '--or1':'#1A56DB','--or2':'#1E40AF','--or3':'#60A5FA','--or4':'#1E3A5F','--or5':'#0D1B30',
    '--bl1':'#000000','--bl2':'#060912','--bl3':'#0B1120','--bl4':'#1A56DB','--bl5':'#2563EB','--bl6':'#60A5FA','--bl7':'#0D1B30',
    '--bg':'#04060D','--surface':'#080D1A','--surface2':'#060A15','--surface3':'#0D1525',
    '--border':'#131E35','--border2':'#1A2A45',
    '--text':'#E8EEFF','--text2':'#8BA3CC','--text3':'#4A5E82',
    '--success':'#22C55E','--danger':'#F87171','--warn':'#FBBF24','--info':'#3B82F6',
    '--shadow':'0 4px 24px rgba(0,0,0,.7)',
    '--sb-top':'#000000','--sb-bot':'#03060F',
    '--lx-top-a':'#000000','--lx-top-b':'#1A56DB'
  },
  'navy-white': { name: 'NAVY MERIDIAN', desc: 'Light / Navy',
    '--or1':'#1D4ED8','--or2':'#2563EB','--or3':'#60A5FA','--or4':'#BFDBFE','--or5':'#EFF6FF',
    '--bl1':'#0F2540','--bl2':'#1B2A4A','--bl3':'#1E3A5F','--bl4':'#1D4ED8','--bl5':'#3B82F6','--bl6':'#93C5FD','--bl7':'#EFF6FF',
    '--bg':'#F4F7FC','--surface':'#FFFFFF','--surface2':'#F0F4FB','--surface3':'#E4EDF8',
    '--border':'#C7D7EF','--border2':'#A8C0E0',
    '--text':'#0D1A2E','--text2':'#2C3E6B','--text3':'#6B7A99',
    '--success':'#059669','--danger':'#DC2626','--warn':'#D97706','--info':'#3B82F6',
    '--shadow':'0 2px 16px rgba(29,78,216,.10)',
    '--sb-top':'#1B2A4A','--sb-bot':'#0F2540',
    '--lx-top-a':'#0F2540','--lx-top-b':'#1D4ED8'
  },
  'black-gold': { name: 'OBSIDIAN GOLD', desc: 'Light / Gold',
    '--or1':'#B8860B','--or2':'#D4A017','--or3':'#F0C040','--or4':'#FAE89A','--or5':'#FDF8ED',
    '--bl1':'#111111','--bl2':'#1A1A1A','--bl3':'#222222','--bl4':'#B8860B','--bl5':'#D4A017','--bl6':'#F0C040','--bl7':'#FDF8ED',
    '--bg':'#F7F4EC','--surface':'#FFFFFF','--surface2':'#FAF6EA','--surface3':'#F5EFD6',
    '--border':'#E0D5B0','--border2':'#D4C488',
    '--text':'#111111','--text2':'#2C2810','--text3':'#7A6A3A',
    '--success':'#2D7A3A','--danger':'#C0392B','--warn':'#B8860B','--info':'#2563EB',
    '--shadow':'0 2px 16px rgba(184,134,11,.12)',
    '--sb-top':'#111111','--sb-bot':'#0A0A0A',
    '--lx-top-a':'#111111','--lx-top-b':'#2A2200'
  },
  'darkblue-orange': { name: 'APOLLO VUE', desc: 'Light / Orange',
    '--or1':'#E85D04','--or2':'#F97316','--or3':'#FB923C','--or4':'#FED7AA','--or5':'#FFF4EE',
    '--bl1':'#0D2B4E','--bl2':'#0F3460','--bl3':'#164E80','--bl4':'#1B5EA0','--bl5':'#2563EB','--bl6':'#93C5FD','--bl7':'#EFF6FF',
    '--bg':'#F0F5FF','--surface':'#FFFFFF','--surface2':'#EBF0FA','--surface3':'#DDE7F5',
    '--border':'#BFD0EE','--border2':'#9BB6E0',
    '--text':'#0D1E35','--text2':'#1E3A5F','--text3':'#5A7AA0',
    '--success':'#059669','--danger':'#DC2626','--warn':'#D97706','--info':'#2563EB',
    '--shadow':'0 2px 16px rgba(232,93,4,.10)',
    '--sb-top':'#0D2B4E','--sb-bot':'#091C33',
    '--lx-top-a':'#0D2B4E','--lx-top-b':'#E85D04'
  },
  'white-green': { name: 'EVERGREEN', desc: 'Light / Green',
    '--or1':'#059669','--or2':'#10B981','--or3':'#34D399','--or4':'#A7F3D0','--or5':'#ECFDF5',
    '--bl1':'#0F2540','--bl2':'#1E3A5F','--bl3':'#164E63','--bl4':'#0E7490','--bl5':'#0891B2','--bl6':'#67E8F9','--bl7':'#ECFEFF',
    '--bg':'#F0F5F4','--surface':'#FFFFFF','--surface2':'#F6FAF9','--surface3':'#EBF5F3',
    '--border':'#D4E6E1','--border2':'#B8D8D2',
    '--text':'#0D1F1C','--text2':'#3D5A55','--text3':'#7A9E99',
    '--success':'#059669','--danger':'#DC2626','--warn':'#D97706','--info':'#0891B2',
    '--shadow':'0 2px 16px rgba(5,150,105,.10)',
    '--sb-top':'#0D2B22','--sb-bot':'#0A1F19',
    '--lx-top-a':'#0D2B22','--lx-top-b':'#059669'
  },
  'grey-blue': { name: 'STEEL STORM', desc: 'Light / Grey Blue',
    '--or1':'#3D5A80','--or2':'#4A6FA0','--or3':'#6B8EB5','--or4':'#B8CCDF','--or5':'#F0F4F8',
    '--bl1':'#1A2638','--bl2':'#253347','--bl3':'#2E4060','--bl4':'#3D5A80','--bl5':'#4A6FA0','--bl6':'#A0B8D0','--bl7':'#E8EEF5',
    '--bg':'#F2F5F8','--surface':'#FFFFFF','--surface2':'#EBF0F5','--surface3':'#DDE5EE',
    '--border':'#C5D0DC','--border2':'#A8B8CB',
    '--text':'#1A2638','--text2':'#2E4060','--text3':'#6A7E96',
    '--success':'#2E7D32','--danger':'#C62828','--warn':'#E65100','--info':'#1565C0',
    '--shadow':'0 2px 16px rgba(61,90,128,.10)',
    '--sb-top':'#1A2638','--sb-bot':'#111B2B',
    '--lx-top-a':'#1A2638','--lx-top-b':'#3D5A80'
  },
  'maroon-cream': { name: 'CRIMSON VELVET', desc: 'Light / Maroon',
    '--or1':'#7B1D2C','--or2':'#9C2836','--or3':'#C1455A','--or4':'#EAB8C2','--or5':'#FDF0F2',
    '--bl1':'#2D0B11','--bl2':'#3D1018','--bl3':'#6B1C2A','--bl4':'#7B1D2C','--bl5':'#9C2836','--bl6':'#D4909A','--bl7':'#FDF0F2',
    '--bg':'#FDF8F0','--surface':'#FFFFFF','--surface2':'#FAF4EC','--surface3':'#F5EBDA',
    '--border':'#E8D5C0','--border2':'#D8C0A8',
    '--text':'#2A1008','--text2':'#4A2010','--text3':'#8A6A58',
    '--success':'#2D5A27','--danger':'#7B1D2C','--warn':'#C96A00','--info':'#1D4E89',
    '--shadow':'0 2px 16px rgba(123,29,44,.10)',
    '--sb-top':'#2D0B11','--sb-bot':'#1C0709',
    '--lx-top-a':'#2D0B11','--lx-top-b':'#7B1D2C'
  }
};

let css = fs.readFileSync('src/index.css', 'utf8');

// replace the entire :root / themes section
let themeCSS = '';
Object.keys(THEMES).forEach((id, index) => {
  let rule = id === 'black-darkblue' ? `:root, \nbody[data-theme="${id}"] {\n` : `body[data-theme="${id}"] {\n`;
  const t = THEMES[id];
  for (let k in t) {
    if (k.startsWith('--')) rule += `  ${k}:${t[k]};\n`;
  }
  rule += '  --radius:10px;--radius-lg:16px;--radius-sm:6px;\n';
  rule += '  --sw:260px;\n';
  rule += '}\n\n';
  themeCSS += rule;
});

// Replaces from /* ══ STEP 10 FEATURES CSS ══ */ or similar down to body[data-font="inter"]
css = css.replace(/\/\* ══════════════════════════════════════════════════\s+THEME A[\s\S]*?body\[data-theme="pearl"\]\{[^}]+\}\s*/s, '/* ── THEMES ── */\n\n' + themeCSS);

fs.writeFileSync('src/index.css', css);

// update settings.jsx THEMES
const settingsStr = fs.readFileSync('src/pages/Settings.jsx', 'utf8');
const newThemesArr = Object.keys(THEMES).map(id => {
  const t = THEMES[id];
  return `  { id: '${id}', name: '${t.name}', desc: '${t.desc}', sidebar: '${t['--sb-top']}', content: '${t['--bg']}', accent: '${t['--or1']}' }`;
});
const newSettingsThemes = `const THEMES = [\n${newThemesArr.join(',\n')}\n];`;
const newSettings = settingsStr.replace(/const THEMES = \[[\\s\\S]*?\];/, newSettingsThemes);
fs.writeFileSync('src/pages/Settings.jsx', newSettings);

// also fix index.css to remove the hardcoded #sb and update it to use --sb-top and --sb-bot
let css2 = fs.readFileSync('src/index.css', 'utf8');
css2 = css2.replace(/body\[data-theme="slate"\] #sb,\s*body\[data-theme="pearl"\] #sb\{\s*background:linear-gradient\(180deg,#1B3A6B 0%,#0F2348 100%\);\s*\}/, '');
css2 = css2.replace(/#sb\{position:fixed;.*?background:linear-gradient\(.*?\);/, '#sb{position:fixed;left:0;top:0;bottom:0;width:var(--sw);background:linear-gradient(180deg,var(--sb-top) 0%,var(--sb-bot) 100%);');

css2 = css2.replace(/#loginWrap\{position:fixed;.*?background:linear-gradient\(.*?\);/, '#loginWrap{position:fixed;inset:0;background:linear-gradient(135deg,var(--bg) 0%,var(--surface2) 50%,var(--surface) 100%);');
css2 = css2.replace(/\.lx-top\{background:linear-gradient\(.*?\);/, '.lx-top{background:linear-gradient(135deg,var(--lx-top-a),var(--lx-top-b));');

fs.writeFileSync('src/index.css', css2);

console.log('Update complete');

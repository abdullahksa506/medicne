/* Bundle the whole app into one self-contained HTML file for preview or sharing.
   The multi-file version stays the deployable one — this is for trying it quickly. */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');

const JS = ['assets/js/data-guides.js', 'assets/js/data-rx.js', 'assets/js/data-tools.js',
  'assets/js/calculators.js', 'assets/js/note-forms.js', 'assets/js/note-engine.js',
  'assets/js/note-ui.js', 'assets/js/app.js'];

const html = read('index.html');
const body = html.split('<body>')[1].split('</body>')[0]
  .replace(/\n<script src="[^"]+"><\/script>/g, '');

const out = `<title>Family Medicine Assistant</title>
<style>
${read('assets/css/app.css')}
</style>
<script>
/* The artifact host owns <html>, so set language and direction from script. */
(function () {
  var r = document.documentElement;
  r.setAttribute('lang', 'en');
  r.setAttribute('dir', 'ltr');
})();
</script>
${body}
<script>
${JS.map(f => '/* ===== ' + f + ' ===== */\n' + read(f)).join('\n')}
</script>
`;

const dest = process.argv[2] || path.join(root, 'dist', 'app-single-file.html');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log('written:', dest, (out.length / 1024).toFixed(0) + ' KB');

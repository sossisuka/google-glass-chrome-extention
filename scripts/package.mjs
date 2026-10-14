import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../',import.meta.url));
execFileSync(process.execPath,[fileURLToPath(new URL('check.mjs',import.meta.url))],{cwd:root,stdio:'inherit'});
const code = `from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import sys
root = Path(sys.argv[1]).resolve()
target = root / 'Google-Glass.zip'
files = sorted((root / 'extension').rglob('*'))
files += [root / name for name in ['README.md', 'INSTALL.en.md', 'INSTALL.ru.md', 'qa/asset-prompts.md', 'qa/results-asset-prompts.md']]
with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
    for file in files:
        if file.is_file():
            archive.write(file, 'Google-Glass/' + file.relative_to(root).as_posix())
with ZipFile(target) as archive:
    assert archive.testzip() is None
    assert 'Google-Glass/extension/manifest.json' in archive.namelist()
print('Created ' + str(target) + ' (' + str(target.stat().st_size) + ' bytes)')
`;
execFileSync('python',['-c',code,root],{cwd:root,stdio:'inherit'});

const {createRequire}=require('node:module');
const themedRequire=createRequire(require.resolve('@heroui/react/package.json'));
const {heroui}=themedRequire('@heroui/theme');
module.exports=heroui();

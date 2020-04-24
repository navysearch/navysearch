"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));require("core-js/modules/es.array.iterator"),require("core-js/modules/es.array.sort"),require("core-js/modules/es.string.split");require("dotenv").config();const meow=require("meow"),getStdin=require("get-stdin"),{cross}=require("figures"),{bold,cyan}=require("chalk"),{format}=require("tomo-cli"),{dict,getCurrentYear}=require("./utils/common.js"),{populate,update}=require("./utils/data.js"),getAction=(a,b,c)=>{const{id:d,key:e,type:f,verbose:g,year:h}=b,i=[...new Set(h.split(","))].sort(),j=dict({populate:function(){var a=(0,_asyncToGenerator2.default)(function*(){yield populate(f,i,{id:d,key:e})});return function(){return a.apply(this,arguments)}}(),update:function(){var a=(0,_asyncToGenerator2.default)(function*(){const a=yield update(f,{id:d,key:e,verbose:g});0<a.objectIDs.length&&process.stdout.write(format(a))});return function(){return a.apply(this,arguments)}}(),info:function(){var a=(0,_asyncToGenerator2.default)(function*(){/* eslint-disable no-console */console.log(`\n  ${bold("ID")}  = `,d),console.log(`  ${bold("Key")} = `,e)});return function info(){return a.apply(this,arguments)}}()/* eslint-enable no-console */});return j.has(a)?j.get(a):b=>{if("string"==typeof a){const b=`\n${bold.red(cross)} "${a}" is not a known command...Please read the help below.\n`;process.stderr.write(b),c()}else process.stdout.write(`STDIN: ${b}`)}},help=`
    ${bold.bgBlue.white(" Navy Search ")}
      
        ${cyan(`"Search for those that ${bold("serve")}"`)}

    ${bold.dim("Usage")}

        ./usn.exe [commands] [options]


    ${bold.dim("Commands")}

        populate, update, version

`,options={help,flags:{help:{type:"boolean",default:!1,alias:"h"},version:{type:"boolean",default:!1,alias:"v"},verbose:{type:"boolean",default:!1,alias:"V"},type:{type:"string",default:"NAVADMIN",alias:"t"},year:{type:"string",default:getCurrentYear()+"",alias:"y"},id:{type:"string",default:process.env.ALGOLIA_APP_ID||bold.red("not set")},key:{type:"string",default:process.env.ALGOLIA_ADMIN_API_KEY||bold.red("not set")}}},{input,flags,showHelp}=meow(options);(0,_asyncToGenerator2.default)(function*(){const a=yield getStdin(),[b]=input,c=getAction(b,flags,showHelp);yield c(a)})();
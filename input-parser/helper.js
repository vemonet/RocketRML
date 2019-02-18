const prefixhelper = require('../helper/prefixHelper.js');
const objectHelper = require('../helper/objectHelper.js');
const functionHelper = require('../function/function.js');
const xmlParser= require('./xmlParser');
const jsonParser= require('./jsonParser');

const subjectFunctionExecution=(functionMap,node,prefixes,data,type)=>{
    functionMap=prefixhelper.checkAndRemovePrefixesFromObject(functionMap,prefixes);
    functionMap=objectHelper.findIdinObjArr(data,functionMap.parentTriplesMap['@id']);
    functionMap=prefixhelper.checkAndRemovePrefixesFromObject(functionMap,prefixes);
    let functionValue=objectHelper.findIdinObjArr(data,functionMap.functionValue['@id']);
    functionValue=prefixhelper.checkAndRemovePrefixesFromObject(functionValue,prefixes);
    let definition=functionHelper.findDefinition(data,functionValue.predicateObjectMap,prefixes);
    let parameters=functionHelper.findParameters(data,functionValue.predicateObjectMap,prefixes);

    let params=calculateParameters(node,parameters,type);
    return functionHelper.executeFunction(definition,params)
};

const calculateParameters=(object,parameters,type)=>{
    let result=[];
    parameters.forEach(function(p){
        let temp=[];
        if(p.type==='constant'){
            temp.push(p.data);
        }else if(p.type==='reference'){
            switch(type){
                case 'XPath':
                    temp=xmlParser.getData(p.data,object);
                    break;
                case 'JSONPath':
                    temp=jsonParser.getData(p.data,object);
                    break;
            }

        }
        if(temp && temp.length===1){
            temp=temp[0];
        }
        result.push(temp);
    });
    return result;
};

const cleanString=(path)=>{
    if(path.startsWith('.')||path.startsWith('/')){
        path=path.substr(1);
    }
    return path;
};

const setObjPredicate=(obj,predicate,data,language,datatype)=>{
    if(datatype){
        datatype=datatype['@id']?datatype['@id']:datatype;
    }
    if(language || datatype){
        if(obj[predicate]) {
            let newObj={
                '@type':datatype,
                '@value':data,
                '@language' : language,
            };
            if(typeof obj[predicate]==='object' && obj[predicate]['@value']){
                let temp=obj[predicate];
                obj[predicate]=[];
                obj[predicate].push(temp);
                obj[predicate].push(newObj);
            }else if(Array.isArray(obj[predicate])){
                obj[predicate].push(newObj);
            }else{
                let temp={
                    '@value':obj[predicate]
                };
                obj[predicate]=[];
                obj[predicate].push(temp);
                obj[predicate].push(newObj);
            }
        }else{
            obj[predicate] = {};
            obj[predicate]['@value'] = data;
            obj[predicate]['@type'] = datatype;
            obj[predicate]['@language'] = language;
        }
    }else{
        if(obj[predicate]){
            Array.isArray(obj[predicate]) ? obj[predicate]=obj[predicate]:obj[predicate]=[obj[predicate]];
            if(typeof obj[predicate][0]==='object'){
                obj[predicate].push({
                    '@value':data
                });
            }else{
                obj[predicate].push(data);
            }
        }else{
            obj[predicate]=data;
        }
    }
};



module.exports.subjectFunctionExecution=subjectFunctionExecution;
module.exports.calculateParameters=calculateParameters;
module.exports.cleanString=cleanString;
module.exports.setObjPredicate=setObjPredicate;

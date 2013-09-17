node_bcs
========

百度云存储 node js SDK


var BCS = require('./bcs').BCS;
var fs=require('fs');

// How To Use？

// 初始化空间

var Bcs = new BCS("bucketname", "ak", "sk",null,null,null);

var version=Bcs.version();//返回SDK版本信息


//设置可选请求头，查照官方RestAPI可选的请求头

var opts={
    "header":{
      "x-bs-acl":"public-read"
    }
}

//建立空间
Bcs.putBucket(callback,opts);

Bcs.putBucket(callback,null);   //可选head可以不填写


//获取空间列表

Bcs.listBucket(callback,null);

//删除空间

Bcs.deleteBucket(callback,null);


//添加文件到云存储
var tmp_path="./1.txt"
var fileContent = fs.readFileSync(tmp_path);//读取文件

Bcs.putObject("/objectName",fileContent,callback,null);


//复制文件到云存储
Bcs.copyObject("/objectName",tmp_path,callback,null);

//删除文件

Bcs.deleteObject("/objectName",callback,null)


//获取文件到本地 命名为filename

Bcs.getObject("/objectName","./filename",callback,null);


//获取文件，返回结果，不下载到本地
Bcs.getObject("/objectName",null,callback,null);

//获取文件信息
Bcs.headObject("/objectName",callback,null);


//获取bucket下文件列表 0 下标  20 返回数量 可选

Bcs.listObject(0,20,callback,null);

//返回所有bucket下文件列表

Bcs.listObject(callback,null);




function callback(err, data) {
    if (!err) {
        console.log('Data: ');
        console.log(data);
    }
    else {
        console.log('Error: ');
        console.log(err);
    }
}



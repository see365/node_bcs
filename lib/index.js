/**
 * @author: 全职幽默
 * @Date: 2013-09-10
 * @Time: 下午8:23
 * 百度云存储 nodeJs SDK  V1.0.1
 */
var crypto = require('crypto');
var http = require('http');
var _host = 'bcs.duapp.com';
var _bucket, _ak, _sk,_t,_i,_s;
var _isSuperFile=false;
/**
 * 初始化 BCS 存储接口
 * @param bucket 存储空间
 * @param ak  公钥(Access Key)
 * @param sk  密钥(Secret Key)
 * @param t 过期时间   可选
 * @param i Ip白名单  可选
 * @param s 文件大小限制 单位：字节   可选
 * return null
 */
var BCS = function (bucket, ak, sk,t,i,s) {
    _bucket = bucket;
    _ak = ak;
    _sk = sk;
    _t=t;
    _i=i;
    _s=s;
}

exports.BCS = BCS;

BCS.prototype.version = function(){
    return '1.0.1';
}


/**
 * 建立bucket
 * @param 回调函数
 * @param opts 可选参数, opts.header可用于指定额外的http header
 */
BCS.prototype.putBucket = function (callback, opts){
    httpAction('PUT',_bucket,null,null,null,null,null,function(err, res){
        if (!err)
            callback(err, res.body);
        else
            callback(err);
    }, opts);
}

/**
 * 删除bucket
 * @param 回调函数
 * @param opts 可选参数, opts.header可用于指定额外的http header
 */
BCS.prototype.deleteBucket = function (callback, opts){
    httpAction('DELETE',_bucket,null,null,null,null,null,function(err, res){
        if (!err)
            callback(err, res.body);
        else
            callback(err);
    }, opts);
}

/**
 * 获取bucket列表
 * @param 回调函数
 * @param opts 可选参数, opts.header可用于指定额外的http header
 */
BCS.prototype.listBucket = function (callback, opts){
    httpAction('GET',null,null,null,null, null,null,function(err, res){
        if (!err)
            callback(err, res.body);
        else
            callback(err);
    }, opts);
}

/**
 * 上传文件
 * @param object 保存在云存储的路径（包含文件名,以“/”开头) 例如：/pic/object
 * @param data 文件内容
 * @param 回调函数
 * @param opts 可选参数, opts.header可用于指定额外的http header
 */
BCS.prototype.putObject = function (object, data, callback, opts){
    httpAction('PUT',_bucket,object,data,null,null,null, function(err, res){
        if (!err)
            callback(err, res.body);
        else
            callback(err);
    }, opts);
}

/**
 * 复制文件
 * @param object 保存在云存储的路径（包含文件名,以“/”开头) 例如：/pic/object
 * @param source_url  源文件路径（完整路径）
 * @param 回调函数
 * @param opts 可选参数, opts.header可用于指定额外的可选http header
 */
BCS.prototype.copyObject = function (object,source_url,callback, opts){
    var copy_opts={"header":{}};
    if(opts){
        copy_opts=opts;
    }
    copy_opts.header['x-bs-copy-source']=source_url;
    httpAction('PUT',_bucket,object,null,null,null,null, function(err, res){
        if (!err)
            callback(err, res.body);
        else
            callback(err);
    }, copy_opts);
}

/**
 * 获取文件 支持下载到本地
 * @param object 保存在云存储的路径（包含文件名,以“/”开头) 例如：/pic/object
 * @param outputFile 可选参数 存储到本地的路径 包含文件名，传null 则不下载到本地
 * @param 回调函数
 * @param opts 可选参数, opts.header可用于指定额外的http header
 */
BCS.prototype.getObject = function (object,outputFile,callback, opts){
    httpAction('GET',_bucket,object,null,outputFile, null,null,function(err, res){
        if (!err)
            callback(err, res.body);
        else
            callback(err);
    }, opts);
}


/**
 * 获取文件信息
 * @param object 保存在云存储的路径（包含文件名,以“/”开头) 例如：/pic/object
 * @param 回调函数
 * @param opts 可选参数, opts.header可用于指定额外的http header
 */
BCS.prototype.headObject = function (object,callback, opts){
    httpAction('HEAD',_bucket,object,null,null, null,null,function(err, res){
        if (!err)
            callback(err, res.headers);
        else
            callback(err);
    }, opts);
}

/**
 * 获取文件列表
 * @param 回调函数
 * @param opts 可选参数, opts.header可用于指定额外的http header
 */
BCS.prototype.listObject = function (start,limit,callback, opts){
    httpAction('GET',_bucket,"/",null,null,start,limit,function(err, res){
        if (!err)
            callback(err, res.body);
        else
            callback(err);
    }, opts);
}


/**
 * 删除文件
 * @param object 保存在云存储的路径（包含文件名,以“/”开头) 例如：/pic/object
 * @param 回调函数
 * @param opts 可选参数, opts.header可用于指定额外的http header
 */
BCS.prototype.deleteObject = function (object,callback, opts){
    httpAction('DELETE',_bucket,object,null,null, null,null,function(err, res){
        if (!err)
            callback(err, res.body);
        else
            callback(err);
    }, opts);
}
/**
 * 上传超级文件
 * @param object 保存在云存储的路径（包含文件名,以“/”开头) 例如：/pic/object
 * @param data 文件内容,上传大于2G的
 * @param 回调函数
 * @param opts 可选参数, opts.header可用于指定额外的http header
 */
BCS.prototype.putSuperfile = function (object, data, callback, opts){
    _isSuperFile=true;
    httpAction('PUT',_bucket,object,data,null,null,null,function(err, res){
        if (!err)
            callback(err, res.body);
        else
            callback(err);
    }, opts);
}

/**
 * 签名方法
 * @param $method 请求方式 {GET, POST, PUT, DELETE}
 * @param url    Object路径
 * @param bucket  bucket值

 * return 签名字符串
 */
function sign(method,url,bucket) {
    var flag="MBO";
    if(_t){flag=flag+"T";}
    if(_i){flag=flag+"I";}
    if(_s){flag=flag+"S";}
    var content= flag + "\n"
        + "Method="+method + "\n"
        + "Bucket="+bucket + "\n"
        + "Object="+url + "\n";
    if(_t){content=content+ "Time="+_t + "\n";}
    if(_i){content=content+ "Ip="+_i + "\n";}
    if(_s){content=content+ "Size="+_s + "\n";}
    var hmac = crypto.createHmac('sha1',_sk );
    hmac.update(content);
    var signature=hmac.digest('base64');
    var sign = flag + ':' + _ak + ':' + encodeURIComponent(signature.toString());
    return sign;
}

function httpAction(method,bucket, url, data,outputFile, start,limit,callback, opts) {
    callback = typeof callback == 'function' ? callback : function() {};

    var sign_url= url?url:"/";
    var sign_bucket= bucket?bucket:"";
    var sign_res=sign(method,sign_url,sign_bucket);
    if(!url){url="";}
    if(!bucket){bucket="";}
    if(_isSuperFile){
        url = '/' + bucket + url+"?superfile=1&sign="+sign_res;
        _isSuperFile=false;
    }else{
        var proper="";
        if(start){
            proper="start="+start+"&";
        }
        if(limit){
            proper=proper+"limit="+limit+"&";
        }
        url = '/' + bucket + url+"?"+proper+"sign="+sign_res;
    }
    var options = {
        host: _host,
        method: method,
        path: url
    };

    var length = data ? (Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data)) : 0;
    var headers = {};


    headers['Content-Length'] = length;

    if (opts && opts.header) {
        for (key in opts.header) {
            headers[key] = opts.header[key];
        }
    }

    options.headers = headers;

    var resData = '';

    var req = http.request(options, function(res) {
        res.setEncoding('binary');
        res.on('data', function (chunk) {
            resData += chunk;
        });
        res.on('end', function() {
            if (outputFile) {
                var fs = require('fs');
                fs.writeFile(outputFile, resData, 'binary', function(err) {
                    callback(err, {
                        headers: res.headers,
                        body: resData
                    });
                })
            }
            else {
                if (res.statusCode >= 400 && res.statusCode < 600) {
                    callback({
                        statusCode: res.statusCode,
                        message: resData
                    });
                }
                else {
                    callback(null, {
                        headers: res.headers,
                        body: resData
                    });
                }
            }
        });
    });

    req.on('error', function(e) {
        if (typeof callback == 'function') {
            callback(e, null);
        }
    });

    data && req.write(data);
    req.end();
}


/**
 * @author bh-lay
 * 
 * demo $.post('/ajax/user',{},function(d){console.log(d)})
 */

var mongo = require('../../conf/mongo_connect');
var querystring=require('querystring');
var session = require('../../conf/session');

function response(res,data){
	res.write(JSON.stringify(data));
	res.end();
}

function add(parm,res){
	var parm = parm;
	mongo.open({'collection_name':'user'},function(err,collection,close){
		collection.find({}, {}).toArray(function(err, docs) {
			parm.id=Date.parse(new Date()).toString(16);

			collection.insert(parm,function(err,result){
				if(err) throw err;
				res.end("{'code':1,'id':"+parm.id+",'msg':'sucess'}");
				close();
			});
		});
	});
}

function edit(parm,res){
	var parm = parm;
	mongo.open({'collection_name':'user'},function(error,collection,close){
		collection.update({'id':parm.id}, {$set:parm}, function(err,docs) {
			if(err) {
			    res.end('{\'code\':2,\'msg\':\'modified failure !\'}');        
			}else {
		        res.end('{\'code\':1,\'msg\':\'modified success !\'}');
			}
			close();
		});
	});
}

exports.render = function (req,res){
	if (req.method == 'POST'){
		var info='';
		req.addListener('data', function(chunk){
			info += chunk; 
		}).addListener('end', function(){
			var data = querystring.parse(info);
			var parm={
				'id' : data['id']||'',
				'usernick':decodeURI(data['usernick']),
				'username':data['username']||'',
				'password':data['password']||'',
				'user_group':data['user_group']||'',
			};
			if(parm['username']){
				
				var session_this = session.start(req,res);
			
				if(parm['id']&&parm['id'].length>2){
					if(session_this.power(12)){
						edit(parm,res)
					}else{
						response(res,{
							'code':2,
							'msg':'no power to edit user !'
						});
					}
				}else{
					if(session_this.power(11)){
						add(parm,res);
					}else{
						response(res,{
							'code':2,
							'msg':'no power to edit user !'
						});
					}
				}
			}else{
				res.end('{\'code\':2,\'msg\':\'please insert complete code !\'}');
			}
		});
	}else{
		res.end('{\'code\':2,\'msg\':\'please use [post] instead [get] to submit !\'}');
	}
}
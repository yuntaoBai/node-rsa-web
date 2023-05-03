# node-rsa-web

兼容支持 网页环境

## 安装
#### yarn
```bash
yarn add node-rsa-web
```
#### npm
```bash
npm install node-rsa-web
```

## 使用方法

```javascript

// 多选一
import Signature from "node-rsa-web" 

// 生成公私钥 ( 1024/2048/..., 'pkcs#*' )
// 默认1024位, pkcs8
let { publicKey, privateKey } = Signature.RSA.generateKeys ( 1024, 'pkcs8' );

console.log ( publicKey, privateKey );

// RSA对象
let rsa = new Signature.RSA ( );

// 设置公私钥
rsa.setPublicKey ( publicKey );
rsa.setPrivateKey ( privateKey );

let unsigned = 'hello world!';

// 字符串签名
let sign = rsa.sign ( unsigned, 'base64'/*buffer|binary|hex*/ );

console.log ( 'sign', sign );

// 签名验证
let verified = rsa.verify ( unsigned, sign, 'base64'/*buffer|binary|hex*/ );

console.log ( 'verified', verified );

let unencrypt = 'Unencrypt string';

// 字符串加密
let encrypted = rsa.encrypt ( unencrypt, 'base64'/*buffer|binary|hex*/ );

console.log ( 'encrypted', encrypted );

// 解密
let decrypted = rsa.decrypt ( encrypted );

console.log ( 'decrypted', decrypted );
```

## 高级用法
```javascript

let keys = Signature.RSA.generateKeys ( );

let signature = new Signature ( );

let rsa = signature.rsa ( );
// let md5 = signature.md5 ( );
// let sha256 = signature.sha256 ( );

let unsigned = 'hello world!';

let sign = rsa
.update ( unsigned ) // 更新源数据
.setPrivateKey ( keys.privateKey ) // 设置私钥
.digest ( 'base64' ); // 生成签名

console.log ( 'sign', sign );

let verified = rsa
.update ( unsigned ) // 更新源数据, 此处可以忽略
.setPublicKey ( keys.publicKey ) // 设置公钥
.verify ( sign, 'base64' ); // 验证签名

console.log ( 'verified', verified );
```

## 对象签名/验签
对象签名模式是先把对象转成`querystring`, 对象内的`json`内容会被转成`JSONString`, 然后再加上签名类型字段, 有盐的话会加盐字段, 最后进行字符串签名.
应用场景:
* 微信支付/支付宝支付签名
* 数据传输签名
```javascript

let signature = new Signature ( );

// 默认的 formOptions, 可以不用设置
signature.formOptions = {
  signKey: 'sign', // 放置签名的字段
  signTypeKey: 'signType', // 放置签名类型的字段
  signSaltKey: 'key', // 盐值字段
  ignoreKeys: [ // 签名忽略的字段
    'sign', 'key'
  ],
  salt: "" // 盐
};

let signer = signature.sha256 ( );
// let signer = signature.rsa ( );

let form = { user: "1589235", userInfo: { 
	nickname: "Liping Ruan",
	avatar: "@%FFOISJAFJZC"
} };

let { sign, querystring } = signer
.update ( form )
.form ( true ) // 设置 签名/验签 为对象签名模式
.digest ( 'hex' ); // 签名输出 16进制 字符串

console.log ( 'sign', sign );

let verified = signer.verify ( sign, 'hex' );

console.log ( 'verified', verified );
```
#### 加盐和自定义`formOptions`
```javascript

let signature = new Signature ( );

let formOptions = signature.formOptions;

formOptions.signKey = 'sign';
formOptions.signTypeKey = 'sign_type';
formOptions.signSaltKey = 'sign_salt';
formOptions.ignoreKeys = [ 'sign', 'sign_salt' ];
formOptions.salt = "Default salt"; // 默认盐, 可以不设置

let keys = Signature.RSA.generateKeys ( 1024 );

let json = { a:1,b:2 };

let signer = signature.rsa ( )
.update ( json )
.setPublicKey ( keys.publicKey )
.setPrivateKey ( keys.privateKey )
.form ( true )
.formOptions ( {
  salt: "This is salt", // &SIGN_SALT=This%20is%20salt
} );


let { sign, querystring } = signer.digest ( 'hex' );

console.log ( 'sign', sign );
console.log ( 'signed form', json );
console.log ( 'signed querystring', querystring );

let verified = signer.verify ( sign, 'hex' );

console.log ( 'verified', verified );
```
## RSA私钥加密/公钥解密
私钥加密公钥解密的需求不大, 所以只实现了字符串加解密
```javascript
let rsa = new Signature.RSA ( );

let keys = Signature.RSA.generateKeys ( 1024 );

// 设置公私钥
rsa.setPrivateKey ( keys.privateKey );

rsa.setPublicKey ( keys.publicKey );

let uncrypted = 'hello world';

console.log ( 'uncrypted', uncrypted );

// 使用私钥加密
let encrypted = rsa.keys.encryptPrivate(uncrypted,'base64'/*buffer|binary|hex*/);

console.log ( 'encrypted', encrypted );

// 使用公钥解密
let decrypted = rsa.keys.decryptPublic ( encrypted, 'utf8' );

console.log ( 'decrypted', decrypted );
```
## RSA加解密Padding更改
支持Padding: 
1. *pkcs1*
2. *pkcs1_oaep (默认)*
更改到与其它端匹配的填充方式: 
```javascript
// RSA对象
rsa.keys.setOptions({encryptionScheme: 'pkcs1'});
```

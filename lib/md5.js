'use strict';

const hash = require ( 'js-md5' );

import Signature from './signature'

export default class Sub extends Signature {
  
  constructor ( ) {
    super ( );

    this.type = "MD5";
  }

  sign ( data, output ) {

    if ( output === 'hex' ) {

      return hash.hex ( data );
    } else {

      return hash.base64 ( data );
    }
  }

  verify ( data, signString, output ) {

    const dataSignString = this.sign ( data, output );

    return dataSignString === signString;
  }
}
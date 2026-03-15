/* 
    未使用foo，不会打包到 bundle 中 
    ==》 treeSharking优化（摇树）技术
*/
import {hello, foo} from './hello.ts'

alert(hello('world'));
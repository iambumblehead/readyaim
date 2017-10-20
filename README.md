readyaim
=========
**(c)[Bumblehead][0]**, [MIT-license](#license)

readyaim provides an aiming mechanism using a THREE.js camera.

readyaim reconstructs parts of the [reticulum][1] library and if you arrived here searching for vr 'reticle' support, you probably want to use [reticulum][1]. This library reconstructs much of the [reticulum][1] library and makes a few changes.

reticulum works well with one long-lived canvas that fills the document. It stores stateful data on 'this' and adds listers to the full document when its constructor is called. 

readyaim operates on specific canvas element(s), and allows canvas states to be added or removed and adds listers to the document once only, delegating to specific canvas states.

<!--
throw errors where needed
-->


_example coming_


[0]: http://www.bumblehead.com "bumblehead"
[1]: https://github.com/skezo/Reticulum "reticulum"


![scrounge](https://github.com/iambumblehead/scroungejs/raw/master/img/hand.png)

(The MIT License)

Copyright (c) [Bumblehead][0] <chris@bumblehead.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

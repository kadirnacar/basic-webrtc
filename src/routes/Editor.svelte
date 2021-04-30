<script type="ts">
import { onMount } from 'svelte';
// import CodeMirror from 'codemirror';
import * as CodeMirror from 'codemirror';
import 'codemirror/mode/clike/clike';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/wrap/hardwrap';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/css-hint';
import 'codemirror/addon/display/rulers';
import 'codemirror/addon/display/panel';
import 'codemirror/keymap/sublime';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/theme/cobalt.css';

let codeEditor;

onMount(() => {
  const editor = CodeMirror.fromTextArea(codeEditor, {
    viewportMargin: Infinity,
    lineNumbers: true,
    matchBrackets: true,
    mode: 'x-shader/x-fragment',
    keyMap: 'sublime',
    autoCloseBrackets: true,
    extraKeys: { 'Ctrl-Space': 'autocomplete' },
    showCursorWhenSelecting: true,
    theme: 'cobalt',
    dragDrop: false,
    autocorrect: true,
    gutters: ['CodeMirror-linenumbers', 'breakpoints'],
    autofocus: true,
    indentWithTabs: true,

    // indentUnit: main.options.indentUnit,
    // tabSize: main.options.tabSize,
    // indentWithTabs: main.options.indentWithTabs,
    // gutters: main.options.lineNumbers ? ['CodeMirror-linenumbers', 'breakpoints'] : false,
    // lineWrapping: main.options.lineWrapping,
    // autofocus: main.options.autofocus,
  });
});
</script>

<style>
</style>

<div class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
  <textarea bind:this={codeEditor}>
    {`/**
    *  Press "Esc" to save, compile and run your program
    */
   
   #ifdef GL_ES
   precision mediump float;
   #endif
   // uniform vec2 u_mouse;   
   uniform vec2 u_resolution; 
   uniform float u_time;
   
   float tanh(float x) {
     float t = clamp(x, -10., 10.);
     t = exp(2. * t);
     return (t-1.)/(t+1.);
   }
   
   vec3 plotAxes(vec2 c) {
     vec3 col = vec3(0.);
   
     vec2 d = vec2(ivec2(c)) - c;
   
   
     col += vec3(smoothstep(0.03, 0.00, abs(0.-d.y)));
     col += vec3(smoothstep(0.03, 0.00, abs(0.-d.x)));
   
     return 0.1*col;
   }
   
   vec3 plotTanh(vec2 c) {
     ivec2 t;
     float y= tanh(c.x);
     float g = smoothstep(0.02, 0.00, abs(y-c.y));
     return vec3(g);
   }
   vec4 render(vec4 coord) {
     vec2 c = coord.xy / u_resolution * 2.0 - 1.0; // [-1, 1]^2
     c.x *= u_resolution.x / u_resolution.y;
   
     c *= 5.;
     vec3 col = vec3(1.);
   
     col -= plotAxes(c);
     col -= plotTanh(c);
   
     return vec4(col, 1.0);
   }
   
   void main(){
     gl_FragColor = render(gl_FragCoord);
   }`}
  </textarea>
</div>

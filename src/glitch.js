/* eslint-disable no-loop-func */
import shuffle from 'lodash/shuffle'
import { TimelineMax } from 'gsap';

// eslint-disable-next-line no-extend-native
String.prototype.replaceAt = function (index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}


let glitchEx=""

// window.onload = glitch.play()

function glitchExtraInit(dom) {
  glitchEx = glitchExtras(dom)
  glitchEx.restart()
}

function glitchText(domElement, finalString = domElement.innerText, speed = 1, glyphs = "&$-£_#ç§µ¤@") {
  glyphs = shuffle(glyphs)
  let timeline = new TimelineMax({
    paused:true,
    onComplete: glitchExtraInit,
    onCompleteParams : [domElement]
  }),

    string=""
  timeline.timeScale(speed)
  domElement.innerText=""
  for (let i = 0; i < finalString.length; i++) {
    let firstrun = true
    let lastGlyph = "",
      newGlyph = ""
    glyphs.forEach(() => {
      do {
        newGlyph = glyphs[Math.floor(Math.random() * glyphs.length)]
      } while (newGlyph === lastGlyph);
  
      if (firstrun) {
        string = string.replaceAt(string.length, newGlyph)
        firstrun = false
      } else {
        string = string.replaceAt(string.length - 1, newGlyph)
      }
      timeline.set(domElement, {innerText:string}, "+=0.05")
      lastGlyph = newGlyph
    });
    string = string.replaceAt(string.length-1, finalString[i])
    timeline.set(domElement, {innerText:string}, "+=0.05")
  }
  return timeline
}

function spanify(dom) {
  let text = dom.innerText
  dom.innerText=""
  for (const letter of text) {
    let span = document.createElement("span")
    span.innerText=letter
    dom.appendChild(span)
  }
}

function glitchExtras(dom) {
  spanify(dom)
  let random = ""
  let dom_arr=[]
  glitchExtras.getRan = () => {
    dom_arr = []
    random = Math.floor(Math.random() * dom.children.length-2)
    if (random < 0) random = 0
    for (let i = 0; i < 3; i++) {dom_arr.push(dom.children[random + i])}
  }
  glitchExtras.getRan()
  let tl = new TimelineMax({
    paused:true,
    onStart: glitchExtras.getRan,
    repeat:-1,
    repeatDelay:5,
    yoyo:true,
  })

  tl.set(dom, {fontStyle:"italic"}, "+=0.6")
  tl.set(dom, {fontStyle:"initial"}, "+=0.1")
  tl.set(dom_arr, {backgroundColor:"white", color:"black"}, "+=0.1")
  tl.set(dom_arr, {backgroundColor:"none", color:"#888"}, "+=0.2")
  tl.set(dom_arr, {backgroundColor:"white", color:"black"}, "+=0.1")
  tl.set(dom_arr, {backgroundColor:"none", color:"#888"}, "+=0.2")
  tl.set([dom.children[2],dom.children[3],dom.children[4],dom.children[5], dom.children[6]], {textDecoration:"line-through"})
  tl.set([dom.children[2],dom.children[3],dom.children[4],dom.children[5], dom.children[6]], {textDecoration:"initial"}, "+=0.2")
  tl.set(dom, {fontStyle:"italic"}, "-=0.3")
  tl.set(dom, {fontStyle:"initial"}, "-=0.1")

  return tl
}


export default glitchText
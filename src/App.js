import React from 'react';
import { TimelineMax, TweenMax} from 'gsap';
import glitchText from './glitch'
import './index.css'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sort: "desc",
      page: 0,
      query: "",
      querySave:"",
      queryData: "",
      renderedData: "",
      apiError:"",
      loading:true,
      animationDone:false,
      bars: [...Array(50)],
      loadingTl: new TimelineMax({ paused: true, onStart: this.loading }),
      stopTl : new TimelineMax({paused:true, onComplete:this.transitionToMain })
    }

    // dom refs needed for gsap animations 
    this.inputDOM = React.createRef()
    this.wrapperDOM = React.createRef() 
    this.loadingtxtDOM = React.createRef()
    this.loadbarDOM = React.createRef()
    this.barsDOM = []
    this.dataDOM = []
    // setInterval definitions for clearing
    this.intBarLoad = ""
    this.intTxtInput  = ""
    this.intTxtLoad =  ""
  }

  getTimelines = () => {
    this.state.loadingTl.to(this.inputDOM, 0.6, { caretColor: "transparent" })
    this.state.loadingTl.to(this.barsDOM, 0.3, {margin:"0 10px", width: 25})
    this.state.loadingTl.set(this.wrapperDOM, { left: "50%" })
    this.state.loadingTl.to(this.wrapperDOM, 25, { ease: "linear", left: "500%" })
    this.state.stopTl.to(this.barsDOM, 2, { width: 50, margin: 0})
  }

  loading = () => {
    // animations for the 3 dots after searching ...
    this.intTxtLoad = setInterval(() => {
      this.loadingtxtDOM.innerText.slice(this.loadingtxtDOM.innerText.length - 3) === "..."
        ? this.loadingtxtDOM.innerText = "searching"
        : this.loadingtxtDOM.innerText += "."
    }, 900)
    // animation to remove the query in the input field
    this.intTxtInput = setInterval(() => {
      if (this.state.query.length > 0) {
        this.setState(prevState => {
          return { query: prevState.query.slice(0, prevState.query.length - 1) };
        });
      } else {
        clearInterval(this.intTxtInput)
        this.loadingtxtDOM.innerText = "searching"
        this.loadbarDOM.removeChild(this.loadbarDOM.firstElementChild) // remove the input field after use
      }
    }, 30)
  }

  loadingAnimation = () => {
    this.state.loadingTl.play() // plays loading function too
    // reboots the loading animation every 7.5 sec 
    this.intBarLoad = setInterval(() => {
      TweenMax.set(this.wrapperDOM, { left: "50%" })
      TweenMax.to(this.wrapperDOM, 25, { ease: "linear", left: "500%" })
    }, 7500)
  }

  transitionToMain = () => {
    clearInterval(this.intBarLoad)
    clearInterval(this.intTxtLoad)
    let tl = new TimelineMax({ paused: true, onComplete: this.textSwap })
    tl.set(this.wrapperDOM, { backgroundColor: "#444", left: "50%", width: "100%", height: "100%" })
    tl.set(this.loadbarDOM, { overflow: "visible" })
    tl.to(this.loadbarDOM, 0.6, { width: "80vw" })
    tl.to(this.loadbarDOM, 0.6, { height: "80vh" }, "-=0.1")

    // removes bars and only leaves the renderedData child
    while (this.wrapperDOM.children.length > 1) {
      this.wrapperDOM.removeChild(this.wrapperDOM.firstChild) 
    }
    tl.play()
  }
  
  textSwap = () => {
    clearInterval(this.intTxtLoad)
    let glitch = glitchText(document.querySelector(".searching"), `Results for "${this.state.querySave}"`, 12)
    glitch.play()
    this.setState({ animationDone: true });
  }

  listenToEnter = () => {
    window.addEventListener('keydown', e => {
      if (e.code === 'Enter') {
        this.getTimelines()
        this.setState({ querySave: this.state.query })
        this.getData()
        this.loadingAnimation()
      }
    })
  }

  componentDidMount() {
    // maps the 50 bars needed
    this.setState(prevState => {
      return { bars: prevState.bars.map((bar, index) =>
      <div
        ref={div => this.barsDOM[index] = div}
        key={index}
        className="bar"
      >
      </div>
      )}
    })
    // starts listening to enter event
    this.listenToEnter()
  }

  // handles change in the input field
  handleChange = event => {
    const { name, value } = event.target
    this.setState({ [name]: value });
  }

  getData = () => {
    this.setState({ loading: true });
    fetch(`https://tpbc.herokuapp.com/search/${this.state.query}/${this.state.page}/?sort=seeds_${this.state.sort}`)
      .then(response => response.json())
      .catch(error => this.setState({ apiError: error }))
      .then (data => { // gets data and maps it
        this.setState({
          queryData: data,
          loading : false,
          renderedData : data.map((queryItem, index) =>
              <div ref={div => this.dataDOM[index] = div} key={index} className="query-item">
                <h1>{queryItem.title}</h1>
                <p className="leeches">{queryItem.leeches}</p>
                <p className="seeds">{queryItem.seeds}</p>
                <p className="size">{queryItem.size}</p>
                <p className="magnet">{queryItem.magnet}</p>
              </div>
            )
        });
      }) // after results are obtained, animation is stopped and results are displayed
      .then(()=>{
        this.state.stopTl.play()
        clearInterval(this.intTxtLoad)
      })
  }

  render() {
    return (
      <div className="container">
        <div ref={ div => this.loadingtxtDOM = div} className="searching">ENTER YOUR QUERY</div>
        <div ref={ div => this.loadbarDOM = div} className="loadbar">
          <input
            ref={ input => this.inputDOM = input}
            className="wrapper input main"
            type="text"
            name="query"
            value={this.state.query}
            onChange = {this.handleChange}
            placeholder="query"
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
        />
          <div
            ref={div => this.wrapperDOM = div}
            className="wrapper"
            >
              {this.state.bars}
              <div id="Api_results">
                {
                  this.state.animationDone && (this.state.renderedData ? this.state.renderedData : <h1>no results</h1> )
                }
              </div>
            </div>
      </div>
    </div>
    )
  }
}

export default App

import React from 'react';
import './App.css';
import { TimelineMax, TweenMax } from 'gsap';
import glitchText from './glitch'
// import logo from './logo.png'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sort: "desc",
      page: 0,
      query: "",
      querySave: "",
      queryData: "",
      renderedData: "",
      apiError: "",
      loading: true,
      animationDone: false,
      bars: [...Array(50)],
      loadingTl: new TimelineMax({ paused: true, onStart: this.loading }),
      stopTl: new TimelineMax({ paused: true, onComplete: this.transitionToMain }),
      focusTl: new TimelineMax({paused: true})
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
    this.intTxtInput = ""
    this.intTxtLoad = ""
  }

  getTimelines = () => {
    let barsMargin = window.innerWidth < 600 ? "0 7px" : "0 10px" // adjusting bars spacing for mobile

    this.state.loadingTl.to(this.inputDOM, 0.6, { caretColor: "transparent" })
    this.state.loadingTl.to(this.barsDOM, 0.3, { margin: barsMargin, width: 25 })
    this.state.loadingTl.set(this.wrapperDOM, { left: "50%" })
    this.state.loadingTl.to(this.wrapperDOM, 25, { ease: "linear", left: "500%" })

    this.state.stopTl.to(this.barsDOM, 2, { width: 50, margin: 0 })
  }

  loading = () => {
    // animations for the 3 dots after searching ...
    this.intTxtLoad = setInterval(() => {
      this.loadingtxtDOM.innerText.slice(this.loadingtxtDOM.innerText.length - 3) === "..."
        ? this.loadingtxtDOM.innerText = "SEARCHING"
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
        this.loadingtxtDOM.innerText = "SEARCHING"
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
    tl.set(this.wrapperDOM, { backgroundColor: "#444", left: "50%", width: "100%", height: "100%", paddingTop:"20px"})
    tl.set(this.loadbarDOM, { overflow: "visible" })
    tl.to(this.loadbarDOM, 0.6, { width: "80vw" })
    tl.to(this.loadbarDOM, 0.6, { height: "80vh" }, "-=0.1")
    // tl.to(this.wrapperDOM, 0.3, {backgroundColor:"#222"}, "-=0.2")

    // removes bars and only leaves the renderedData child
    while (this.wrapperDOM.children.length > 1) {
      this.wrapperDOM.removeChild(this.wrapperDOM.firstChild)
    }
    tl.play()
  }

  textSwap = () => {
    clearInterval(this.intTxtLoad)
    let glitch = glitchText(document.querySelector(".searchingtxt"), `Results for "${this.state.querySave}"`, 12)
    glitch.play()
    this.setState({ animationDone: true });
  }

  listenToEnter = () => {
    window.addEventListener('keydown', e => {
      if (e.keyCode === 13 && this.state.query !== "") {
        this.getTimelines()
        this.setState({ querySave: this.state.query })
        this.getData()
        this.loadingAnimation()
      }
    })
  }

  openQueryItem = (index, event) => {
    this.dataDOM.forEach(element => {
      if (element !== this.dataDOM[index]) element.classList.remove("opened")
    })
    event.currentTarget.classList.toggle("opened")
  }

  componentDidMount() {
    // maps the 50 bars needed
    this.setState(prevState => {
      return {
        bars: prevState.bars.map((bar, index) =>
          <div
            ref={div => this.barsDOM[index] = div}
            key={index}
            className="bar"
          >
          </div>
        )
      }
    })
    // starts listening to enter event
    this.listenToEnter()
    // sets up focus Timeline
    // this.state.focusTl.from(this.inputDOM.parentElement, 0.3, { border: "5px solid black" })
    // this.state.focusTl.from(this.inputDOM, 0.3, { backgroundColor: "white" }, "-=0.3")
  }


  handleFocus = () => {
    this.state.focusTl.play()
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
      .then(data => { // gets data and maps it
        this.setState({
          queryData: data,
          loading: false,
          renderedData: data.map((queryItem, index) =>
            <div
              onClick={e => this.openQueryItem(index, e)}
              ref={div => this.dataDOM[index] = div}
              key={index}
              className="query-item">
              <a className="magnet" href={queryItem.magnet}>
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 512 512">
                  <path d="M382.56,233.376C379.968,227.648,374.272,224,368,224h-64V16c0-8.832-7.168-16-16-16h-64c-8.832,0-16,7.168-16,16v208h-64
			c-6.272,0-11.968,3.68-14.56,9.376c-2.624,5.728-1.6,12.416,2.528,17.152l112,128c3.04,3.488,7.424,5.472,12.032,5.472
			c4.608,0,8.992-2.016,12.032-5.472l112-128C384.192,245.824,385.152,239.104,382.56,233.376z"/>
                  <path d="M432,352v96H80v-96H16v128c0,17.696,14.336,32,32,32h416c17.696,0,32-14.304,32-32V352H432z" />
                </svg>
              </a>
              <div className="title" >{queryItem.title}</div>
              <div className="subcat">category : {queryItem.subcat}</div>
              <div className="leeches">leeches : {queryItem.leeches}</div>
              <div className="seeds">seeds : {queryItem.seeds}</div>
              <div className="size">size : {queryItem.size}</div>
            </div>
          )
        });
      }) // after results are obtained, animation is stopped and results are displayed
      .then(() => {
        this.state.stopTl.play()
        clearInterval(this.intTxtLoad)
      })
  }

  // getDataFake = () => {
  //   this.setState({ loading: true });
  //   setTimeout(() => {
  //     this.setState({ loading: false });
  //     this.state.stopTl.play()
  //     clearInterval(this.intTxtLoad)
  //   }, 2000);
  // }

  render() {
    return (
      <div className="container">
        <div className="container-wrapper">
          {/* <div className="logo">
            <img className="logo" src={logo} alt="logo"/>
            <span>the pirate bay</span>  
          </div> */}
          <div className="query">
            <div className="searching">
              <div ref={div => this.loadingtxtDOM = div} className="searchingtxt">ENTER YOUR QUERY</div>
            </div>
            <div ref={div => this.loadbarDOM = div} className="loadbar">
            <input
              ref={input => this.inputDOM = input}
              className="wrapper input main"
              type="text"
              name="query"
              value={this.state.query}
              onChange={this.handleChange}
              placeholder="query"
              spellCheck="false"
              autoComplete="off"
              autoCorrect="off"
              maxLength="20"
              onFocus={this.handleFocus}
            />
            <div
              ref={div => this.wrapperDOM = div}
              className="wrapper"
            >
              {this.state.bars}
              <div className={ this.state.animationDone ? null : 'hidden'} id="Api_results">
                {
                  this.state.renderedData.length> 0 ? this.state.renderedData : <h1>no results</h1>  
                }
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App

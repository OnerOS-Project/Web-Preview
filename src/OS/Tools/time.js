import React from "react";

class Clock extends React.Component {
    constructor(props) {
      super(props);
      this.state = { date: new Date() };
    }
  
    componentDidMount() {
      this.timerID = setInterval(() => this.tick(), 1000);
    }
  
    componentWillUnmount() {
      clearInterval(this.timerID);
    }
  
    tick() {
      this.setState({ date: new Date() });
    }
  
    render() {
      const options = { hour: '2-digit', minute: '2-digit' };
      const currentTime = this.state.date.toLocaleTimeString([], options);
  
      return (
        <div id="clock">
          <h3>{currentTime}</h3>
        </div>
      );
    }
  }
  

export default Clock;
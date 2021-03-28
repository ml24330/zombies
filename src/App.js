import { useState, useRef } from 'react';
import './App.css';
import useEventListener from './useEventListener.js';
import { useStopwatch } from 'react-timer-hook';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import cursor from './cursor.svg';
import background from './background.png';
import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';

const TWO_KEY = ['50', 'Digit2', '2'];
const THREE_KEY = ['51', 'Digit3', '3'];
const FOUR_KEY = ['52', 'Digit4', '4'];
const ESCAPE_KEY = ['27', 'Escape'];

function App() {

  const { seconds, minutes, hours, days, isRunning, start, pause, reset} = useStopwatch();

  const [show, setShow] = useState(true);
  const [state, setState] = useState('WAITING');
  const [twoCount, setTwoCount] = useState(0);
  const [threeCount, setThreeCount] = useState(0);
  const [fourCount, setFourCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [score, setScore] = useState({hours: 0, minutes: 0, seconds: 0, twos: 0, threes: 0, fours: 0, clicks: 0})

  const two = useRef();
  const three = useRef();
  const four = useRef();
  const click = useRef();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  function startGame() {
    setState('READY');
    reset();
    setTwoCount(0);
    setThreeCount(0);
    setFourCount(0);
    setClickCount(0);
  }

  function endGame() {
    setState('ENDED');
    setScore({hours: hours, minutes: minutes, seconds: seconds, twos: twoCount, threes: threeCount, fours: fourCount, clicks: clickCount});
    reset();
    setShow(true);
  }

  function calculateTime(hour, minute, second) {
    return hour*360+minute*60+second;
  }

  function renderTime(hour, minute, second) {
    if(second < 10) {
      second = `0${second}`;
    }
    if(minute < 10) {
      minute = `0${minute}`;
    }
    if(hour === 0) {
      hour = '';
    } else {
      hour = `${hour} :`
    }
    return (<>
      {hour} {minute} : {second}
    </>)
  }

  function renderScore() {
    return (<>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th width="30%">#</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Time</td>
              <td>{calculateTime(score.hours, score.minutes, score.seconds)} seconds</td>
            </tr>
            <tr>
              <td>Twos</td>
              <td>{score.twos}</td>
            </tr>
            <tr>
              <td>Threes</td>
              <td>{score.threes}</td>
            </tr>
            <tr>
              <td>Fours</td>
              <td>{score.fours}</td>
            </tr>
            <tr>
              <td>Total</td>
              <td>{score.twos + score.threes + score.fours}</td>
            </tr>
            <tr>
              <td>Clicks</td>
              <td>{score.clicks}</td>
            </tr>
            <tr>
              <td>CPS</td>
              <td>{Math.floor(score.clicks / calculateTime(score.hours, score.minutes, score.seconds))}</td>
            </tr>
          </tbody>
        </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>)
  }

  function display() {
    switch(state) {
      case 'WAITING':
        return <span>Welcome! When you are ready to begin, press the button below.</span>
      case 'READY':
        return <span>Now that you are ready, start spamming 2/3/4 while clicking and the timer will automatically start.</span>
      case 'INGAME':
        return <span>Good luck! The timer is now running. When you are tired, press <code style={{color: "black"}}>esc</code> on your keyboard to stop.</span>
      case 'ENDED':
        return <span>Your previous attempt has ended! Start a new attempt by pressing the button below.</span>
      default:
        return <></>
    }
  }

  function handler({ key }) {
    if (( TWO_KEY.includes(String(key)) || THREE_KEY.includes(String(key)) || FOUR_KEY.includes(String(key)) ) && twoCount === 0 && threeCount === 0 && fourCount === 0 && state === 'READY') {
      start();
      setState('INGAME');
    }

    if (TWO_KEY.includes(String(key))) {
      setTwoCount(prev => ++prev);
      two.current.style.backgroundColor = 'grey';
      setTimeout(() => {
        two.current.style.backgroundColor = 'white'
      }, 100);
    } else if (THREE_KEY.includes(String(key))) {
      setThreeCount(prev => ++prev);
      three.current.style.backgroundColor = 'grey';
      setTimeout(() => {
        three.current.style.backgroundColor = 'white'
      }, 100);
    } else if (FOUR_KEY.includes(String(key))) {
      setFourCount(prev => ++prev);
      four.current.style.backgroundColor = 'grey';
      setTimeout(() => {
        four.current.style.backgroundColor = 'white'
      }, 100);
    } else if (ESCAPE_KEY.includes(String(key)) && state === 'INGAME') {
      endGame();
    } 
  }

  function handleClick() {
    if(!['INGAME', 'READY'].includes(state)) {
      return;
    }
    setClickCount(prev => ++prev);
    if(!click.current) {
      return;
    }
    click.current.style.backgroundColor = 'grey';
    setTimeout(() => {
      click.current.style.backgroundColor = 'white'
    }, 100);
  }

  useEventListener('keydown', handler);

  return (<div onClick={() => handleClick()} style={{width: "100vw", height: "100vh", padding: "20px"}}>
    <img src={background} alt="background" style={{position: "fixed", height: "100vh", width: "100vw", zIndex: "-9999", opacity: "0.2", left: "0", top: "0"}} />
    <h2>
      Zombies quickswitch practice
    </h2>
    <div>
      {display()}
    </div>
    <Button variant="info" onClick={() => startGame()}>I'm ready</Button>
    <div>
      {['READY', 'INGAME', 'ENDED'].includes(state) && (
        <>
          <span className="container">
            <span className="key" style={{backgroundColor: "white"}} ref={two}>2</span>
            <span className="key" style={{backgroundColor: "white"}} ref={three}>3</span>
            <span className="key" style={{backgroundColor: "white"}} ref={four}>4</span>
          </span>
        <span className="container"><span className="key" style={{backgroundColor: "white"}} ref={click}><img src={cursor} style={{width: "auto", height: "80px", margin: "auto", transform: "translate(5px, -3px)"}} alt="cursor" /></span></span>
        </>
      )}
      <div className="timer">{renderTime(hours, minutes, seconds)}</div>
    </div>
    {state === 'ENDED' && (
      <div>
        {renderScore()}
      </div>
    )}
  </div>);
}

export default App;

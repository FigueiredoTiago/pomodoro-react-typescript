/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState, useCallback } from "react";
import { useInterval } from "../hooks/Use-interval";
import { secondsToTime } from "../utils/seconds-to-time";

import Button from "./button";
import Timer from "./timer";
const bellStart = require("../sounds/bell-start.mp3");
const bellFinish = require("../sounds/bell-finish.mp3");

const audioStartWorking = new Audio(bellStart);
const audioStopWorking = new Audio(bellFinish);

interface Props {
  pomodoroTime: number;
  shortRestTime: number;
  longRestTime: number;
  cycles: number;
}

export function pomodoroTimer(props: Props): JSX.Element {
  const [mainTime, setMainTime] = useState(props.pomodoroTime);
  const [timeCounting, setTimeCounting] = useState(false);
  const [working, setWorking] = useState(false);
  const [resting, setResting] = useState(false);
  const [cyclesQtdManager, setCyclesQtdManager] = useState(
    new Array(props.cycles - 1).fill(true)
  );

  useInterval(
    () => {
      setMainTime(mainTime - 1);
      if (working) setFullWorkingTime(fullWorkingTime + 1);
    },
    timeCounting ? 1000 : null
  );

  const configureWork = useCallback(() => {
    setTimeCounting(true);
    setWorking(true);
    setResting(false);
    setMainTime(props.pomodoroTime);
    audioStartWorking.play();
  }, [
    setTimeCounting,
    setWorking,
    setResting,
    setMainTime,
    props.pomodoroTime,
  ]);

  const configureRest = useCallback(
    (Long: boolean) => {
      setTimeCounting(true);
      setWorking(false);
      setResting(true);

      if (Long) {
        setMainTime(props.longRestTime);
      } else {
        setMainTime(props.shortRestTime);
      }

      audioStopWorking.play();
    },
    [
      setMainTime,
      setTimeCounting,
      setWorking,
      setResting,
      props.longRestTime,
      props.shortRestTime,
    ]
  );

  const [completedCycles, setCompletedCycles] = useState(0);
  const [fullWorkingTime, setFullWorkingTime] = useState(0);
  const [numberOfPomodoros, setNumberOfPomodoros] = useState(0);

  useEffect(() => {
    if (working) document.body.classList.add("working");
    if (resting) document.body.classList.remove("working");
    if (mainTime > 0) return;

    if (working && cyclesQtdManager.length > 0) {
      configureRest(false);
      cyclesQtdManager.pop();
    } else if (working && cyclesQtdManager.length <= 0) {
      configureRest(true);
      setCyclesQtdManager(new Array(props.cycles - 1).fill(true));
      setCompletedCycles(completedCycles + 1);
    }

    if (working) setNumberOfPomodoros(numberOfPomodoros + 1);
    if (resting) configureWork();
  }, [
    working,
    resting,
    mainTime,
    configureRest,
    setCyclesQtdManager,
    configureWork,
    cyclesQtdManager,
    numberOfPomodoros,
    props.cycles,
    completedCycles,
  ]);

  return (
    <div className="pomodoro">
      <h2>You are: {working ? "WORKING" : "RESTING"}</h2>

      <Timer mainTime={mainTime} />

      <div className="controls">
        <Button text="WORK" onClick={() => configureWork()} />
        <Button text="REST" onClick={() => configureRest(false)} />
        <Button
          text={timeCounting ? "PAUSE" : "PLAY"}
          onClick={() => setTimeCounting(!timeCounting)}
          className={!working && !resting ? "hidden" : ""}
        />
      </div>

      <div className="details">
        <p>Ciclos concluídos: {completedCycles}</p>
        <p>Horas Trabalhadas: {secondsToTime(fullWorkingTime)}</p>
        <p>Pomodoros concluídos: {numberOfPomodoros}</p>
      </div>
    </div>
  );
} 

export default pomodoroTimer;

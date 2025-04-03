import { createActor } from 'xstate';
import { createBrowserInspector } from '@statelyai/inspect';

import { watchMachine } from "./watchMachine";

// Les boutons qui envoient des événements à la machine
const ESC = document.getElementById("ESC");
const SET = document.getElementById("SET");
const UP = document.getElementById("UP");
// L'affichage de l'heure / alarme / timer
const time = document.getElementById("time");
const date = document.getElementById("date");
const alarm = document.getElementById("alarm");
const timer = document.getElementById("timer");

const inspector = createBrowserInspector();
const actor = createActor(watchMachine,
    {  inspect: inspector.inspect, }
);

actor.subscribe((state) => {
    console.log("Current state:", state.value);
    time.style.display = "none";
    date.style.display = "none";
    alarm.style.display = "none";
    timer.style.display = "none";
    switch (true) {
        case state.matches({NormalMode: {Display: 'Time'}}):
        case state.matches({NormalMode: 'ChangeTime'}):
            time.style.display = "block";
            break;
        case state.matches({NormalMode: {Display: 'Date'}}):
        case state.matches({NormalMode: 'ChangeDate'}):
            date.style.display = "block";
            break;
        case state.matches({NormalMode: {Display: 'Alarm'}}):
        case state.matches({NormalMode: 'ChangeAlarm'}):
            alarm.style.display = "block";
            break;
        case state.matches({NormalMode: 'Timer'}):
            timer.style.display = "block";
            break;                
        default:
    }

    time.textContent = state.context.currentTime.toFormat("hh:mm:ss");
    date.textContent = state.context.currentTime.toFormat("dd/MM/yyyy");
    alarm.textContent = state.context.alarmTime.toFormat("hh:mm:ss");
    timer.textContent = state.context.timer.toFormat("hh:mm:ss");
  });
  
  actor.start();

ESC.addEventListener("click", () => {
    actor.send({ type: "ESC"});
});
SET.addEventListener("click", () => {
    actor.send({ type: "SET"});
});
UP.addEventListener("click", () => {
    actor.send({ type: "UP"});
});


// On envoie le signal d'horloge à la machine toutes les secondes
setInterval(() => actor.send({ type: "CLOCKTICK"}) , 1000);
import { createMachine, createActor } from "xstate";
import { createBrowserInspector } from "@statelyai/inspect";

// Les éléments HTML de la page
const lamp = document.getElementById("lamp");
const switchButton = document.getElementById("switch");
const counterText = document.getElementById("counter");

let count = 0;

const lampMachine = createMachine(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QBsCGBbADgOjVg8gGaEDEAygOoCSAKgMIASA2gAwC6iomA9rAJYAXPtwB2nEAA9EARgCsATmwAmedIBsADiXbZLAOx6ANCACeMvWuyy9GubIDMSjda0aAvm+N4c3-CPLU9Mzs4jz8QqLiUghyiirqWjr6RqaIttiOKroALPIs9gXuHsYi3BBw4t6hvILCYkiSiAC0asZmCC3FIN64GJhEhNXhdVGI2UptMiyKNnr2DgtK0vYael09vvVcNRFbjQhOShnSSrLSLNkF9mry9int0ifKq-Ovsksrax5uQA */
        id: "lamp",
        initial: "lampOff",
        states: {
            lampOff: {
                on: {
                    SWITCH: {
                        target: "lampOn",
                        actions: ["turnOn"],
                    },
                },
            },
            lampOn: {
                on: {
                    SWITCH: {
                        target: "lampOff",
                        actions: ["turnOff"],
                    },
                },
            },
        },
    },
    {
        actions: {
            turnOn: (context, event) => {
                lamp.src = "/light_on.gif";
                count++;
                counterText.innerHTML = count;
            },
            turnOff: (context, event) => {
                lamp.src = "/light_off.gif";
            },
        },
    }
);

const inspector = createBrowserInspector();
const actor = createActor(lampMachine, { inspect: inspector.inspect });

// Quand on clique sur le bouton, on envoie un événement "SWITCH" au statechart
switchButton.addEventListener("click", () => {
    actor.send({ type: "SWITCH" });
});

actor.subscribe((state) => { // Appelé chaque fois que le statechart change d'état
    console.log("Current state:", state.value);
});
// On démarre le statechart
actor.start();

import Konva from "konva";
import { createMachine, createActor } from 'xstate';

// L'endroit où le dessin va être affiché
const stage = new Konva.Stage({
    container: "container",
    width: 400,
    height: 400,
});

// Une couche pour le dessin
const dessin = new Konva.Layer();
// Une couche pour la polyline en cours de construction
const temporaire = new Konva.Layer();
stage.add(dessin);
stage.add(temporaire);

const MAX_POINTS = 10;
let polyline; // La polyline en cours de construction;

const polylineMachine = createMachine(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QAcD2AbAngGQJYDswA6XCdMAYgFkB5AVQGUBRAYWwEkWBpAbQAYAuohSpYuAC65U+YSAAeiAKwA2InwCc6gBwAWPloDsigwCYAjFvWKANCEyIAtGZPqiiixp0BmdXsVevEwBfINs0LDxCIggAJwBDAHcCKGp6ZloANSZ+ISQQNDFJaVkFBC8NIh1tMz4DPncdZVt7BAcTQ0qzd3VlL0tDbxCwjBwCYljE5NTGVg5uHNkCiSkZPNKAszVlAy1DfxrFeubEHyItM29dHQM+-TN1IfyRyPH4pPwUgCE4gGMAa1gyF+YAWeSWRVWoFK3lcil0vmUfBcBh6x1aJj4XiIphqzguWhUfUe4VGUQm7xSTHw4jAMVBIkKKxKiC6WKsmm8GL4fB0aPxRBMyh0imFgrFWm2xOeY2ibymTFgPziyBBgkWomWxTWiB0WjcFzMARMcOUIv0vLsjkCmwCxj4iJRF2NOilERl5KmtBmbE4vDMuQZmsh8hO+jcwvcikFuz4XTRJlO90RWi8yi6SJ0Jhdj3wqAgcHVbsI6sZWqhjmcfCI6m5F005UFZhRaIcej1vWMCfKZjrildpOIpHIJaDzNapmrtaq6gbaebltaNQMahnGhF6h77i8-ZessmHxHELHCb1Lg5XjqEoCOxbS5X5SsVU3zgMIRCQA */
        id: "polyLine",
        initial: "idle",
        states: {
            idle: {
                on: {
                    MOUSECLICK: {
                        target: "drawing",
                        actions: ["createLine"],
                    }
                }
            },
            drawing: {
                on: {
                    MOUSEMOVE: {
                        actions: ["setLastPoint"]
                    },
                    MOUSECLICK: [{
                        guard: "pasPlein",
                        actions: ["addPoint"]
                    }, {
                        target: "idle",
                        reenter: true,
                        actions: ["addPoint","saveLine"]
                    }],
                    Backspace: {
                        guard: "plusDeUnPoint",
                        actions: ["removeLastPoint"]
                    },
                    Enter: {
                        guard: "plusDeUnPoint",
                        actions: ["saveLine"],
                        target: "idle"
                    },
                    Escape: {
                        actions: ["abandon"],
                        target: "idle"
                    }
                }
            },
        }
    },
    {
        actions: {
            // Créer une nouvelle polyline
            createLine: (context, event) => {
                const pos = stage.getPointerPosition();
                polyline = new Konva.Line({
                    points: [pos.x, pos.y, pos.x, pos.y],
                    stroke: "red",
                    strokeWidth: 2,
                });
                temporaire.add(polyline);
            },
            // Mettre à jour le dernier point (provisoire) de la polyline
            setLastPoint: (context, event) => {
                const pos = stage.getPointerPosition();
                const currentPoints = polyline.points(); // Get the current points of the line
                const size = currentPoints.length;

                const newPoints = currentPoints.slice(0, size - 2); // Remove the last point
                polyline.points(newPoints.concat([pos.x, pos.y]));
                temporaire.batchDraw();
            },
            // Enregistrer la polyline
            saveLine: (context, event) => {
                polyline.remove(); // On l'enlève de la couche temporaire
                const currentPoints = polyline.points(); // Get the current points of the line
                const size = currentPoints.length;
                // Le dernier point(provisoire) ne fait pas partie de la polyline
                const newPoints = currentPoints.slice(0, size - 2);
                polyline.points(newPoints);
                polyline.stroke("black"); // On change la couleur
                // On sauvegarde la polyline dans la couche de dessin
                dessin.add(polyline); // On l'ajoute à la couche de dessin
            },
            // Ajouter un point à la polyline
            addPoint: (context, event) => {
                const pos = stage.getPointerPosition();
                const currentPoints = polyline.points(); // Get the current points of the line
                const newPoints = [...currentPoints, pos.x, pos.y]; // Add the new point to the array
                polyline.points(newPoints); // Set the updated points to the line
                temporaire.batchDraw(); // Redraw the layer to reflect the changes
            },
            // Abandonner le tracé de la polyline
            abandon: (context, event) => {
                polyline.remove();
            },
            // Supprimer le dernier point de la polyline
            removeLastPoint: (context, event) => {
                const currentPoints = polyline.points(); // Get the current points of the line
                const size = currentPoints.length;
                const provisoire = currentPoints.slice(size - 2, size); // Le point provisoire
                const oldPoints = currentPoints.slice(0, size - 4); // On enlève le dernier point enregistré
                polyline.points(oldPoints.concat(provisoire)); // Set the updated points to the line
                temporaire.batchDraw(); // Redraw the layer to reflect the changes
            },
        },
        guards: {
            // On peut encore ajouter un point
            pasPlein: (context, event) => {
                return polyline.points().length < MAX_POINTS * 2;
            },
            // On peut supprimer un point
            plusDeUnPoint: (context, event) => {
                return polyline.points().length > 4;
            }
        },
    }
);
// On démarre la machine d'état
const actor = createActor(polylineMachine);
actor.start();

// On transmet les événements au statechart
stage.on("click", () => {
    actor.send({ type: "MOUSECLICK" });
});

stage.on("mousemove", () => {
    actor.send({ type: "MOUSEMOVE" });
});

// Envoi des touches clavier à la machine
window.addEventListener("keydown", (event) => {
    actor.send({ type: event.key });
});

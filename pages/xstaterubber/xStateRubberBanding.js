import Konva from "konva";
import { createMachine, createActor } from 'xstate';
import { createBrowserInspector } from '@statelyai/inspect';

// L'endroit où on va dessiner
const stage = new Konva.Stage({
  container: "container",
  width: '400',
  height: 400,
});

// Une couche pour la ligne en cours de dessin (il peut y en avoir plusieurs)
const temporaire = new Konva.Layer();
// Une couche pour les lignes déjà dessinées
const dessin = new Konva.Layer();
stage.add(dessin);
stage.add(temporaire);


// La ligne en cours de dessin
let rubber;

const rubberBandingMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QCcCuAjdZkCECGAdhAJYFQB0xEANmAMQCyA8gKoDKAogMIAyAklwDSAbQAMAXUSgADgHtYxAC7FZBKSAAeiAMwA2cgE4DogBwAmbdrO6DJgCwmDAVgA0IAJ6IAjAHYn5LzszIN9dUSc7XRMnAF8YtzRMbHwiUgoIZDwAdzTGVk5mADUOMUkkEDkFZVV1LQRtLxNDXV0vUW1baycnXTdPBBbydqdLJ3NWnyDY+JBErFxCEjJyDOzc5nZufiFS9UqlFTVyur1DY3NLa1sHHz7EQeHR8d8g3TiZglkIOHU55MW0nt5AcasdEABaLxefRmLwdYJ2UQ+ZyOEx3BDg2HkMwmPw+Hy6HwWRFIuIJDDzFJLChUWhAqqHWoQqLYuEGBFIlG2dFmUzNFpIuxQnyiYJvGZ-BapZarHJkekgo6gOpi7GIuw9XROAwNRrorwGHzkJxmE287qWIWRd4xIA */
    id: "rubberBanding",
    initial: "idle",
    states: {
      idle: {
        on: {
          MOUSECLICK: {
            target: "drawing",
            actions: ["createLine"],
          },
        },
      },
      drawing: {
        on: {
          MOUSEMOVE: {
            actions: ["setLastPoint"],
          },
          MOUSECLICK: {
            target: "idle",
            actions: ["saveLine"],
          },
        },
      },
    },
  },
  {
    actions: {
        // Crée une ligne à la position du clic, les deux points sont confondus
      createLine: (context, event) => {
        const pos = stage.getPointerPosition();
        rubber = new Konva.Line({
          // Les points de la ligne sont stockés comme un tableau de coordonnées x,y
          points: [pos.x, pos.y, pos.x, pos.y],
          stroke: "red",
          strokeWidth: 2,
        });
        temporaire.add(rubber);
      },
      // Modifie le dernier point de la ligne en cours de dessin
      setLastPoint: (context, event) => {
        const pos = stage.getPointerPosition();
        rubber.points([rubber.points()[0], rubber.points()[1], pos.x, pos.y]);
        temporaire.batchDraw();
      },
      // Sauvegarde la ligne
      saveLine: (context, event) => {
        rubber.remove(); // On l'enlève de la couche temporaire
        rubber.stroke("black"); // On change la couleur
        dessin.add(rubber); // On l'ajoute à la couche de dessin
      }
    },
  }
);

// On démarre la machine
const inspector = createBrowserInspector();
const actor = createActor(rubberBandingMachine,
    {  inspect: inspector.inspect, }
);

actor.start();

// On transmet les événements souris à la machine
stage.on("click", () => {
  actor.send({ type: "MOUSECLICK" });
});

stage.on("mousemove", () => {
  actor.send( {type: "MOUSEMOVE"} );
});